// ============================================
// Main Server Entry Point
// Wires together all modules
// ============================================

import type { Candle, Signal, IndicatorValues } from "./packages/core/types";
import { evaluateStrategy } from "./packages/core/strategy";
import { computeIndicators } from "./packages/core/indicators";
import { MarketSocket } from "./ws/marketSocket";
import { PaperTradingEngine } from "./engine/paperTrading";
import { initAPI, handleRequest } from "./api/routes";
import { createWSHandler, broadcastSignal, broadcastPortfolio, broadcastPrice, broadcastIndicators } from "./ws/dashboardSocket";
import { initMongoDB, saveTrade, updateTrade, saveSignal, addLog } from "./db/mongoStore";
import { initPostgres, recordAnalytics } from "./db/postgresStore";
import { explainSignal } from "./ai/openaiService";
import { fetchHistoricalCandles } from "./backtest/backtestEngine";

// ---- Configuration ----
const PORT = parseInt(process.env.PORT || "3001");
const SYMBOL = process.env.SYMBOL || "btcusdt";
const INITIAL_BALANCE = parseFloat(process.env.INITIAL_BALANCE || "10000");

// ---- State ----
const candleHistory: Candle[] = [];
let latestSignal: Signal | null = null;
let latestIndicators: IndicatorValues | null = null;
let prevIndicators: IndicatorValues | null = null;

// ---- Initialize Engines ----
const tradingEngine = new PaperTradingEngine(INITIAL_BALANCE);

async function main() {
  console.log("🚀 Starting AI Trading Bot...");
  console.log(`   Symbol: ${SYMBOL.toUpperCase()}`);
  console.log(`   Initial Balance: $${INITIAL_BALANCE}`);
  console.log(`   API Port: ${PORT}`);

  // ---- Init databases ----
  await initMongoDB();
  await initPostgres();

  // ---- Pre-load historical data for warmup ----
  try {
    console.log("📥 Loading historical data for indicator warmup...");
    const historicalCandles = await fetchHistoricalCandles(SYMBOL.toUpperCase(), "1m", 300);
    candleHistory.push(...historicalCandles);
    console.log(`✅ Loaded ${historicalCandles.length} historical candles`);
  } catch (err) {
    console.warn("⚠️ Could not fetch historical data, starting cold:", err);
  }

  // ---- Connect to Binance WebSocket ----
  const marketSocket = new MarketSocket(SYMBOL);

  // ---- Init API dependencies ----
  initAPI({
    getPortfolioState: () => tradingEngine.getState(),
    getLatestSignal: () => latestSignal,
    getLatestIndicators: () => latestIndicators,
    getCandleHistory: () => candleHistory,
    getCurrentPrice: () => marketSocket.getCurrentPrice(),
  });

  // ---- Start HTTP + WebSocket server ----
  const wsHandler = createWSHandler();

  const server = Bun.serve({
    port: PORT,
    async fetch(req, server) {
      // Upgrade WebSocket connections
      const url = new URL(req.url);
      if (url.pathname === "/ws") {
        const success = server.upgrade(req);
        if (success) return undefined;
        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      // Handle REST API
      return handleRequest(req);
    },
    websocket: wsHandler,
  });

  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);

  marketSocket.onCandle(async (candle: Candle) => {
    try {
      // Add to history (deduplicate by timestamp)
      const existingIdx = candleHistory.findIndex((c) => c.time === candle.time);
      if (existingIdx !== -1) {
        candleHistory[existingIdx] = candle;
      } else {
        candleHistory.push(candle);
      }

      // Keep last 500 candles
      if (candleHistory.length > 500) {
        candleHistory.splice(0, candleHistory.length - 500);
      }

      // Broadcast price
      broadcastPrice(candle.close, candle);

      // Need at least 200 candles for EMA200
      if (candleHistory.length < 200) {
        console.log(`⏳ Warming up... ${candleHistory.length}/200 candles`);
        return;
      }

      // ---- Evaluate Strategy ----
      const signal = evaluateStrategy({
        candles: candleHistory,
        prevIndicators,
      });

      latestSignal = signal;
      latestIndicators = signal.indicators ?? null;
      prevIndicators = latestIndicators;

      // Save signal to DB
      await saveSignal(signal);

      // Broadcast to dashboard
      broadcastSignal(signal);
      if (latestIndicators) broadcastIndicators(latestIndicators);

      // ---- Process through trading engine ----
      if (signal.type !== "HOLD") {
        const atr = signal.indicators?.atr ?? 0;
        const trade = tradingEngine.processSignal(signal, atr);

        if (trade) {
          if (trade.status === "OPEN") {
            await saveTrade(trade);
          } else {
            await updateTrade(trade);
          }

          // AI Explanation
          if (signal.type === "BUY" || signal.type === "SELL") {
            const explanation = await explainSignal(signal);
            signal.aiExplanation = explanation;
            console.log(`🤖 AI: ${explanation}`);
          }

          broadcastPortfolio(tradingEngine.getState());
        }
      }

      // Record analytics periodically
      await recordAnalytics(tradingEngine.getState());

      addLog("info", `Signal: ${signal.type} @ $${signal.price.toFixed(2)} | RSI: ${signal.indicators?.rsi.toFixed(1)}`);
    } catch (err) {
      console.error("❌ Error processing candle:", err);
      addLog("error", `Processing error: ${err}`);
    }
  });

  console.log("✅ Trading bot is running!");
  console.log("📊 Waiting for candle data...");
}

main().catch(console.error);