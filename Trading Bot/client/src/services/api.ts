// ============================================
// API Service - Frontend to Backend communication
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001/ws";

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed: boolean;
  time: number;
}

export interface Signal {
  type: "BUY" | "SELL" | "HOLD";
  price: number;
  timestamp: number;
  reason: string;
  aiExplanation?: string;
  indicators?: IndicatorValues;
}

export interface IndicatorValues {
  rsi: number;
  ema50: number;
  ema200: number;
  atr: number;
  volumeSMA: number;
  adx?: number;
}

export interface Trade {
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
}

export interface PortfolioState {
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
}

export interface DashboardData {
  currentPrice: number;
  currentSignal: Signal | null;
  portfolio: PortfolioState;
  recentTrades: Trade[];
  indicators: IndicatorValues | null;
  candles: Candle[];
}

export interface BacktestResult {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  netProfit: number;
  netProfitPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  trades: Trade[];
  equityCurve: { time: number; equity: number }[];
}

// ---- REST API Calls ----
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getDashboard: () => apiFetch<DashboardData>("/api/dashboard"),
  getTrades: (limit = 50) => apiFetch<Trade[]>(`/api/trades?limit=${limit}`),
  getSignals: (limit = 50) => apiFetch<Signal[]>(`/api/signals?limit=${limit}`),
  getStats: () => apiFetch<any>("/api/stats"),
  runBacktest: (symbol = "BTCUSDT", limit = 1000) =>
    apiFetch<BacktestResult>("/api/backtest", {
      method: "POST",
      body: JSON.stringify({ symbol, limit }),
    }),
  chat: (message: string) =>
    apiFetch<{ response: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  health: () => apiFetch<{ status: string; uptime: number }>("/api/health"),
};

// ---- WebSocket Connection ----
type WSCallback = (event: string, data: any) => void;

export class DashboardWebSocket {
  private ws: WebSocket | null = null;
  private callbacks: WSCallback[] = [];
  private reconnectDelay = 2000;

  connect() {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log("🔗 Dashboard WS connected");
      this.reconnectDelay = 2000;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.callbacks.forEach((cb) => cb(data.event, data.data));
      } catch {
        // ignore
      }
    };

    this.ws.onclose = () => {
      console.log("🔌 Dashboard WS disconnected, reconnecting...");
      setTimeout(() => this.connect(), this.reconnectDelay);
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 15000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  onMessage(callback: WSCallback) {
    this.callbacks.push(callback);
  }

  close() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
  }
}
