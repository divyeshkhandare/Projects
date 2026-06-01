// ============================================
// Backtesting Engine
// Fetch historical data + replay through strategy
// ============================================

import type { Candle, BacktestResult, Trade, Signal, IndicatorValues } from "../packages/core/types";
import { evaluateStrategy } from "../packages/core/strategy";
import { computeIndicators } from "../packages/core/indicators";

/**
 * Fetch historical klines from Binance REST API
 */
export async function fetchHistoricalCandles(
  symbol: string = "BTCUSDT",
  interval: string = "1m",
  limit: number = 1000
): Promise<Candle[]> {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;

  console.log(`📥 Fetching ${limit} historical candles for ${symbol}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch candles: ${response.statusText}`);
  }

  const data = await response.json();

  const candles: Candle[] = (data as any[]).map((kline: any) => ({
    time: kline[0],
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5]),
    isClosed: true, // historical candles are all closed
  }));

  console.log(`✅ Fetched ${candles.length} candles`);
  return candles;
}

/**
 * Run backtest on historical candles
 * Uses the SAME strategy as live trading (no future leakage)
 */
export function runBacktest(
  allCandles: Candle[],
  initialBalance: number = 10000
): BacktestResult {
  console.log(`🔬 Running backtest on ${allCandles.length} candles...`);

  let balance = initialBalance;
  let maxBalance = initialBalance;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;

  const trades: Trade[] = [];
  const equityCurve: { time: number; equity: number }[] = [];
  let openTrade: Trade | null = null;
  let tradeCounter = 0;
  let wins = 0;
  let losses = 0;
  let prevIndicators: IndicatorValues | null = null;

  // Need at least 200 candles for EMA200
  const warmupPeriod = 200;

  for (let i = warmupPeriod; i < allCandles.length; i++) {
    // Only use candles up to current index (no future leakage)
    const candleWindow = allCandles.slice(Math.max(0, i - 300), i + 1);
    const currentCandle = allCandles[i]!;
    const price = currentCandle.close;

    // Evaluate strategy with current window
    const signal = evaluateStrategy({
      candles: candleWindow,
      prevIndicators,
    });

    prevIndicators = signal.indicators ?? null;

    // Check exit conditions for open trade
    if (openTrade) {
      let exitReason = "";

      if (price <= openTrade.stopLoss) {
        exitReason = "Stop Loss";
      } else if (price >= openTrade.takeProfit) {
        exitReason = "Take Profit";
      } else if (signal.type === "SELL") {
        exitReason = "Sell Signal";
      }

      if (exitReason) {
        const pnl = (price - openTrade.entryPrice) * openTrade.quantity;
        const pnlPercent = ((price - openTrade.entryPrice) / openTrade.entryPrice) * 100;

        openTrade = {
          ...openTrade,
          exitPrice: price,
          exitTime: currentCandle.time,
          status: "CLOSED",
          pnl,
          pnlPercent,
          reason: `${openTrade.reason} → ${exitReason}`,
        };

        balance += pnl;
        maxBalance = Math.max(maxBalance, balance);

        const drawdown = maxBalance - balance;
        const drawdownPct = (drawdown / maxBalance) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
        maxDrawdownPercent = Math.max(maxDrawdownPercent, drawdownPct);

        if (pnl > 0) wins++;
        else losses++;

        trades.push(openTrade);
        openTrade = null;
      }
    }

    // Open new trade on BUY signal (if no open trade)
    if (!openTrade && signal.type === "BUY") {
      tradeCounter++;
      const positionSize = balance * 0.95;
      const quantity = positionSize / price;
      const indicators = signal.indicators!;
      const atr = indicators.atr;

      const stopLossDistance = atr > 0 ? atr * 1.5 : price * 0.02;

      openTrade = {
        id: `bt_${tradeCounter}`,
        type: "BUY",
        entryPrice: price,
        entryTime: currentCandle.time,
        quantity,
        stopLoss: price - stopLossDistance,
        takeProfit: price + stopLossDistance * 2,
        status: "OPEN",
        reason: signal.reason,
      };
    }

    // Track equity curve
    const unrealizedPnl = openTrade
      ? (price - openTrade.entryPrice) * openTrade.quantity
      : 0;

    equityCurve.push({
      time: currentCandle.time,
      equity: balance + unrealizedPnl,
    });
  }

  // Close any remaining open trade at last price
  if (openTrade) {
    const lastPrice = allCandles[allCandles.length - 1]!.close;
    const pnl = (lastPrice - openTrade.entryPrice) * openTrade.quantity;
    openTrade = {
      ...openTrade,
      exitPrice: lastPrice,
      exitTime: allCandles[allCandles.length - 1]!.time,
      status: "CLOSED",
      pnl,
      pnlPercent: ((lastPrice - openTrade.entryPrice) / openTrade.entryPrice) * 100,
      reason: `${openTrade.reason} → End of backtest`,
    };
    balance += pnl;
    if (pnl > 0) wins++;
    else losses++;
    trades.push(openTrade);
  }

  const totalTrades = wins + losses;

  const result: BacktestResult = {
    totalTrades,
    wins,
    losses,
    winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
    netProfit: balance - initialBalance,
    netProfitPercent: ((balance - initialBalance) / initialBalance) * 100,
    maxDrawdown,
    maxDrawdownPercent,
    trades,
    equityCurve,
  };

  console.log("📊 Backtest Results:");
  console.log(`   Total Trades: ${result.totalTrades}`);
  console.log(`   Win Rate: ${result.winRate.toFixed(1)}%`);
  console.log(`   Net Profit: $${result.netProfit.toFixed(2)} (${result.netProfitPercent.toFixed(2)}%)`);
  console.log(`   Max Drawdown: $${result.maxDrawdown.toFixed(2)} (${result.maxDrawdownPercent.toFixed(2)}%)`);

  return result;
}
