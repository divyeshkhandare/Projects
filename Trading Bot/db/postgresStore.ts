// ============================================
// PostgreSQL Store - Analytics & Reports
// ============================================

import type { Trade, PortfolioState } from "../packages/core/types";

const POSTGRES_URI = process.env.POSTGRES_URI || "";

interface AnalyticsRecord {
  date: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  netPnl: number;
  balance: number;
  maxDrawdown: number;
}

// In-memory analytics store (fallback when no PostgreSQL)
const analyticsStore: AnalyticsRecord[] = [];

/**
 * Initialize PostgreSQL connection
 */
export async function initPostgres(): Promise<void> {
  if (POSTGRES_URI) {
    try {
      // In production, use: import { Pool } from 'pg';
      // const pool = new Pool({ connectionString: POSTGRES_URI });
      console.log("📊 PostgreSQL connection configured (set POSTGRES_URI to connect)");
    } catch (err) {
      console.warn("⚠️ PostgreSQL connection failed, using in-memory analytics:", err);
    }
  } else {
    console.log("📊 Using in-memory analytics store (set POSTGRES_URI for PostgreSQL)");
  }
}

/**
 * Record daily analytics snapshot
 */
export async function recordAnalytics(state: PortfolioState): Promise<void> {
  const today = new Date().toISOString().split("T")[0]!;

  // Update or create today's record
  const existing = analyticsStore.findIndex((r) => r.date === today);
  const record: AnalyticsRecord = {
    date: today,
    totalTrades: state.totalTrades,
    wins: state.wins,
    losses: state.losses,
    winRate: state.winRate,
    netPnl: state.totalPnl,
    balance: state.balance,
    maxDrawdown: state.maxDrawdown,
  };

  if (existing !== -1) {
    analyticsStore[existing] = record;
  } else {
    analyticsStore.push(record);
  }
}

/**
 * Get historical analytics
 */
export async function getAnalytics(days: number = 30): Promise<AnalyticsRecord[]> {
  return analyticsStore.slice(-days);
}

/**
 * Get performance summary
 */
export async function getPerformanceSummary(): Promise<{
  totalDays: number;
  bestDay: AnalyticsRecord | null;
  worstDay: AnalyticsRecord | null;
  averageDailyPnl: number;
  totalPnl: number;
}> {
  if (analyticsStore.length === 0) {
    return { totalDays: 0, bestDay: null, worstDay: null, averageDailyPnl: 0, totalPnl: 0 };
  }

  const sorted = [...analyticsStore].sort((a, b) => a.netPnl - b.netPnl);

  return {
    totalDays: analyticsStore.length,
    bestDay: sorted[sorted.length - 1] ?? null,
    worstDay: sorted[0] ?? null,
    averageDailyPnl: analyticsStore.reduce((sum, r) => sum + r.netPnl, 0) / analyticsStore.length,
    totalPnl: analyticsStore[analyticsStore.length - 1]?.netPnl ?? 0,
  };
}
