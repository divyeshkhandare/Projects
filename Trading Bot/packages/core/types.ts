// ============================================
// Shared Types - Used by both server and client
// ============================================

export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed: boolean;
  time: number;
};

export type Signal = {
  type: "BUY" | "SELL" | "HOLD";
  price: number;
  timestamp: number;
  reason: string;
  indicators?: IndicatorValues;
  aiExplanation?: string;
};

export type IndicatorValues = {
  rsi: number;
  ema50: number;
  ema200: number;
  atr: number;
  volumeSMA: number;
  adx?: number;
};

export type Trade = {
  id: string;
  type: "BUY" | "SELL";
  entryPrice: number;
  exitPrice?: number;
  entryTime: number;
  exitTime?: number;
  quantity: number;
  pnl?: number;
  pnlPercent?: number;
  stopLoss: number;
  takeProfit: number;
  status: "OPEN" | "CLOSED";
  reason: string;
};

export type PortfolioState = {
  balance: number;
  initialBalance: number;
  openTrade: Trade | null;
  tradeHistory: Trade[];
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  maxDrawdown: number;
};

export type BacktestResult = {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  netProfit: number;
  netProfitPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio?: number;
  trades: Trade[];
  equityCurve: { time: number; equity: number }[];
};

export type DashboardData = {
  currentPrice: number;
  currentSignal: Signal | null;
  portfolio: PortfolioState;
  recentTrades: Trade[];
  indicators: IndicatorValues | null;
  candles: Candle[];
};
