// ============================================
// Standalone Backtest Runner Script
// Run with: bun run scripts/runBacktest.ts
// ============================================

import { fetchHistoricalCandles, runBacktest } from "../backtest/backtestEngine";

const SYMBOL = process.env.SYMBOL || "BTCUSDT";
const LIMIT = parseInt(process.env.LIMIT || "1000");
const INITIAL_BALANCE = parseFloat(process.env.INITIAL_BALANCE || "10000");

async function main() {
  console.log("============================================");
  console.log("  📊 BACKTEST RUNNER");
  console.log("============================================");
  console.log(`  Symbol: ${SYMBOL}`);
  console.log(`  Candles: ${LIMIT}`);
  console.log(`  Initial Balance: $${INITIAL_BALANCE}`);
  console.log("============================================\n");

  const candles = await fetchHistoricalCandles(SYMBOL, "1m", LIMIT);
  const result = runBacktest(candles, INITIAL_BALANCE);

  console.log("\n============================================");
  console.log("  📈 BACKTEST RESULTS");
  console.log("============================================");
  console.log(`  Total Trades:     ${result.totalTrades}`);
  console.log(`  Wins:             ${result.wins}`);
  console.log(`  Losses:           ${result.losses}`);
  console.log(`  Win Rate:         ${result.winRate.toFixed(1)}%`);
  console.log(`  Net Profit:       $${result.netProfit.toFixed(2)} (${result.netProfitPercent.toFixed(2)}%)`);
  console.log(`  Max Drawdown:     $${result.maxDrawdown.toFixed(2)} (${result.maxDrawdownPercent.toFixed(2)}%)`);
  console.log("============================================");

  if (result.trades.length > 0) {
    console.log("\n📋 Trade Details:");
    result.trades.forEach((t, i) => {
      const emoji = (t.pnl ?? 0) >= 0 ? "✅" : "❌";
      console.log(`  ${emoji} #${i + 1}: ${t.type} @ $${t.entryPrice.toFixed(2)} → $${t.exitPrice?.toFixed(2)} | PnL: $${t.pnl?.toFixed(2)} (${t.pnlPercent?.toFixed(2)}%)`);
    });
  }
}

main().catch(console.error);
