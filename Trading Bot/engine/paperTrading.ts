// ============================================
// Paper Trading Engine
// Simulates trades with virtual balance
// ============================================

import type { Signal, Trade, PortfolioState, IndicatorValues } from "../packages/core/types";

export class PaperTradingEngine {
  private balance: number;
  private initialBalance: number;
  private openTrade: Trade | null = null;
  private tradeHistory: Trade[] = [];
  private tradeCounter = 0;
  private maxBalance: number;
  private maxDrawdown = 0;
  private wins = 0;
  private losses = 0;

  constructor(initialBalance: number = 10000) {
    this.initialBalance = initialBalance;
    this.balance = initialBalance;
    this.maxBalance = initialBalance;
  }

  /**
   * Process a signal - open or close trades
   */
  processSignal(signal: Signal, atr: number = 0): Trade | null {
    const { type, price, timestamp, reason } = signal;

    // If we have an open trade, check for exit
    if (this.openTrade) {
      // Check stop loss / take profit
      const shouldExit = this.checkExitConditions(price, timestamp);
      if (shouldExit) return shouldExit;

      // Signal-based exit: SELL when holding a BUY position
      if (type === "SELL" && this.openTrade.type === "BUY") {
        return this.closeTrade(price, timestamp, reason);
      }

      return null; // Hold position
    }

    // Open new trade on BUY signal
    if (type === "BUY") {
      return this.openNewTrade(price, timestamp, reason, atr);
    }

    return null;
  }

  /**
   * Open a new long trade
   */
  private openNewTrade(price: number, timestamp: number, reason: string, atr: number): Trade {
    this.tradeCounter++;

    // Position sizing: use 95% of balance
    const positionSize = this.balance * 0.95;
    const quantity = positionSize / price;

    // Stop loss: ATR-based or fixed 2%
    const stopLossDistance = atr > 0 ? atr * 1.5 : price * 0.02;
    const stopLoss = price - stopLossDistance;

    // Take profit: 2:1 risk-reward
    const takeProfit = price + stopLossDistance * 2;

    const trade: Trade = {
      id: `trade_${this.tradeCounter}`,
      type: "BUY",
      entryPrice: price,
      entryTime: timestamp,
      quantity,
      stopLoss,
      takeProfit,
      status: "OPEN",
      reason,
    };

    this.openTrade = trade;
    console.log(`📈 OPENED TRADE #${trade.id} @ ${price.toFixed(2)} | SL: ${stopLoss.toFixed(2)} | TP: ${takeProfit.toFixed(2)}`);

    return trade;
  }

  /**
   * Close an open trade
   */
  private closeTrade(exitPrice: number, exitTime: number, reason: string): Trade {
    if (!this.openTrade) throw new Error("No open trade to close");

    const trade = { ...this.openTrade };
    trade.exitPrice = exitPrice;
    trade.exitTime = exitTime;
    trade.status = "CLOSED";
    trade.pnl = (exitPrice - trade.entryPrice) * trade.quantity;
    trade.pnlPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
    trade.reason = `${trade.reason} → Exit: ${reason}`;

    this.balance += trade.pnl;
    this.maxBalance = Math.max(this.maxBalance, this.balance);

    // Track drawdown
    const drawdown = ((this.maxBalance - this.balance) / this.maxBalance) * 100;
    this.maxDrawdown = Math.max(this.maxDrawdown, drawdown);

    // Track wins/losses
    if (trade.pnl > 0) this.wins++;
    else this.losses++;

    this.tradeHistory.push(trade);
    this.openTrade = null;

    const emoji = trade.pnl > 0 ? "✅" : "❌";
    console.log(`${emoji} CLOSED TRADE #${trade.id} @ ${exitPrice.toFixed(2)} | PnL: ${trade.pnl.toFixed(2)} (${trade.pnlPercent.toFixed(2)}%)`);

    return trade;
  }

  /**
   * Check stop loss and take profit
   */
  private checkExitConditions(currentPrice: number, timestamp: number): Trade | null {
    if (!this.openTrade) return null;

    if (currentPrice <= this.openTrade.stopLoss) {
      return this.closeTrade(currentPrice, timestamp, "Stop Loss hit");
    }

    if (currentPrice >= this.openTrade.takeProfit) {
      return this.closeTrade(currentPrice, timestamp, "Take Profit hit");
    }

    return null;
  }

  /**
   * Get current portfolio state
   */
  getState(): PortfolioState {
    const totalTrades = this.wins + this.losses;
    return {
      balance: this.balance,
      initialBalance: this.initialBalance,
      openTrade: this.openTrade,
      tradeHistory: this.tradeHistory,
      totalPnl: this.balance - this.initialBalance,
      winRate: totalTrades > 0 ? (this.wins / totalTrades) * 100 : 0,
      totalTrades,
      wins: this.wins,
      losses: this.losses,
      maxDrawdown: this.maxDrawdown,
    };
  }

  /**
   * Get recent trades
   */
  getRecentTrades(limit: number = 20): Trade[] {
    return this.tradeHistory.slice(-limit);
  }
}
