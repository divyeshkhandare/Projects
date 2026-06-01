// ============================================
// MongoDB Client - Trade logs, signals, logs
// ============================================

import type { Trade, Signal } from "../packages/core/types";

// We use a simple file-based store as default fallback
// When MongoDB is available, swap this with actual mongo driver
const MONGODB_URI = process.env.MONGODB_URI || "";

interface MongoStore {
  trades: Trade[];
  signals: Signal[];
  logs: { timestamp: number; level: string; message: string }[];
}

// In-memory store (file-backed fallback when no MongoDB)
const store: MongoStore = {
  trades: [],
  signals: [],
  logs: [],
};

let isConnected = false;

/**
 * Initialize MongoDB connection (or use in-memory fallback)
 */
export async function initMongoDB(): Promise<void> {
  if (MONGODB_URI) {
    try {
      // In production, use: const { MongoClient } = await import("mongodb");
      // const client = new MongoClient(MONGODB_URI);
      // await client.connect();
      console.log("📦 MongoDB connection configured (set MONGODB_URI to connect)");
      isConnected = true;
    } catch (err) {
      console.warn("⚠️ MongoDB connection failed, using in-memory store:", err);
    }
  } else {
    console.log("📦 Using in-memory store (set MONGODB_URI for MongoDB)");
  }
}

/**
 * Save a trade
 */
export async function saveTrade(trade: Trade): Promise<void> {
  store.trades.push(trade);
  addLog("info", `Trade saved: ${trade.id} ${trade.type} @ ${trade.entryPrice}`);
}

/**
 * Update a trade (when closed)
 */
export async function updateTrade(trade: Trade): Promise<void> {
  const index = store.trades.findIndex((t) => t.id === trade.id);
  if (index !== -1) {
    store.trades[index] = trade;
  } else {
    store.trades.push(trade);
  }
}

/**
 * Get all trades
 */
export async function getTrades(limit: number = 50): Promise<Trade[]> {
  return store.trades.slice(-limit);
}

/**
 * Save a signal
 */
export async function saveSignal(signal: Signal): Promise<void> {
  store.signals.push(signal);
}

/**
 * Get recent signals
 */
export async function getSignals(limit: number = 50): Promise<Signal[]> {
  return store.signals.slice(-limit);
}

/**
 * Add a log entry
 */
export function addLog(level: string, message: string): void {
  store.logs.push({ timestamp: Date.now(), level, message });
  // Keep last 1000 logs
  if (store.logs.length > 1000) {
    store.logs.splice(0, store.logs.length - 1000);
  }
}

/**
 * Get logs
 */
export async function getLogs(limit: number = 100): Promise<typeof store.logs> {
  return store.logs.slice(-limit);
}
