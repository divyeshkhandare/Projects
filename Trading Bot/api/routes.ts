// ============================================
// REST API Layer - Bun.serve HTTP endpoints
// ============================================

import type { Signal, PortfolioState, Trade, BacktestResult, DashboardData, Candle, IndicatorValues } from "../packages/core/types";
import { getTrades, getSignals, getLogs } from "../db/mongoStore";
import { getAnalytics, getPerformanceSummary } from "../db/postgresStore";
import { chatWithBot } from "../ai/openaiService";
import { fetchHistoricalCandles, runBacktest } from "../backtest/backtestEngine";

// Shared state references (set by main server)
let getPortfolioState: () => PortfolioState;
let getLatestSignal: () => Signal | null;
let getLatestIndicators: () => IndicatorValues | null;
let getCandleHistory: () => Candle[];
let getCurrentPrice: () => number;

export function initAPI(deps: {
  getPortfolioState: () => PortfolioState;
  getLatestSignal: () => Signal | null;
  getLatestIndicators: () => IndicatorValues | null;
  getCandleHistory: () => Candle[];
  getCurrentPrice: () => number;
}) {
  getPortfolioState = deps.getPortfolioState;
  getLatestSignal = deps.getLatestSignal;
  getLatestIndicators = deps.getLatestIndicators;
  getCandleHistory = deps.getCandleHistory;
  getCurrentPrice = deps.getCurrentPrice;
}

/**
 * CORS headers for frontend access
 */
function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

/**
 * JSON response helper
 */
function json(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(),
  });
}

/**
 * Handle API routes
 */
export async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    // ---- Dashboard (aggregated data) ----
    if (path === "/api/dashboard") {
      const data: DashboardData = {
        currentPrice: getCurrentPrice(),
        currentSignal: getLatestSignal(),
        portfolio: getPortfolioState(),
        recentTrades: getPortfolioState().tradeHistory.slice(-20),
        indicators: getLatestIndicators(),
        candles: getCandleHistory().slice(-100),
      };
      return json(data);
    }

    // ---- Trades ----
    if (path === "/api/trades") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const trades = await getTrades(limit);
      return json(trades);
    }

    // ---- Signals ----
    if (path === "/api/signals") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const signals = await getSignals(limit);
      return json(signals);
    }

    // ---- Portfolio Stats ----
    if (path === "/api/stats") {
      const portfolio = getPortfolioState();
      const analytics = await getAnalytics();
      const summary = await getPerformanceSummary();
      return json({ portfolio, analytics, summary });
    }

    // ---- Logs ----
    if (path === "/api/logs") {
      const logs = await getLogs();
      return json(logs);
    }

    // ---- Backtest ----
    if (path === "/api/backtest" && req.method === "POST") {
      const body = (await req.json()) as { symbol?: string; limit?: number };
      const symbol = body.symbol || "BTCUSDT";
      const limit = body.limit || 1000;

      const candles = await fetchHistoricalCandles(symbol, "1m", limit);
      const result = runBacktest(candles);
      return json(result);
    }

    // ---- AI Chat ----
    if (path === "/api/chat" && req.method === "POST") {
      const body = (await req.json()) as { message: string };
      if (!body.message) return json({ error: "Message required" }, 400);

      const response = await chatWithBot(
        body.message,
        getPortfolioState(),
        getLatestSignal()
      );
      return json({ response });
    }

    // ---- Health Check ----
    if (path === "/api/health") {
      return json({ status: "ok", uptime: process.uptime() });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("API Error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}
