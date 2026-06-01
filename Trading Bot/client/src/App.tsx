  // ============================================
// Main App - Trading Dashboard
// ============================================

import { useState, useEffect, useCallback } from "react";
import { api, DashboardWebSocket } from "./services/api";
import type { DashboardData, Signal, PortfolioState, IndicatorValues, Candle, Trade } from "./services/api";
import { PriceChart } from "./components/PriceChart";
import { StatsCards } from "./components/StatsCards";
import { SignalDisplay } from "./components/SignalDisplay";
import { TradeTable } from "./components/TradeTable";
import { PnlChart } from "./components/PnlChart";
import { ChatBot } from "./components/ChatBot";
import { BacktestSection } from "./components/BacktestSection";
import "./App.css";

function App() {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioState>({
    balance: 10000,
    initialBalance: 10000,
    openTrade: null,
    tradeHistory: [],
    totalPnl: 0,
    winRate: 0,
    totalTrades: 0,
    wins: 0,
    losses: 0,
    maxDrawdown: 0,
  });
  const [indicators, setIndicators] = useState<IndicatorValues | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  const fetchDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      setCurrentPrice(data.currentPrice);
      setCurrentSignal(data.currentSignal);
      setPortfolio(data.portfolio);
      setIndicators(data.indicators);
      setCandles(data.candles);
      setIsConnected(true);
      setError(null);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError("Cannot connect to backend. Is the server running?");
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Poll every 10 seconds as fallback
    const interval = setInterval(fetchDashboard, 10000);

    // WebSocket for real-time updates
    const ws = new DashboardWebSocket();
    ws.onMessage((event, data) => {
      setLastUpdate(new Date().toLocaleTimeString());
      setIsConnected(true);

      switch (event) {
        case "price":
          setCurrentPrice(data.price);
          if (data.candle) {
            setCandles((prev) => {
              const updated = [...prev, data.candle];
              return updated.slice(-100);
            });
          }
          break;
        case "signal":
          setCurrentSignal(data);
          setIndicators(data.indicators ?? null);
          break;
        case "portfolio":
          setPortfolio(data);
          break;
        case "indicators":
          setIndicators(data);
          break;
      }
    });

    ws.connect();

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [fetchDashboard]);

  return (
    <div className="app">
      {/* ---- Header ---- */}
      <header className="header" id="dashboard-header">
        <div className="header__brand">
          <div className="header__logo">⚡</div>
          <div>
            <div className="header__title">AI Trading Bot</div>
            <div className="header__subtitle">BTC/USDT · Paper Trading · 1m Kline</div>
          </div>
        </div>
        <div className="header__status">
          <div className="status-dot">
            <span className={`status-dot__circle ${!isConnected ? 'status-dot__circle--offline' : ''}`} />
            {isConnected ? "Connected" : "Disconnected"}
          </div>
          {lastUpdate && (
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              Updated: {lastUpdate}
            </span>
          )}
        </div>
      </header>

      {/* ---- Error Banner ---- */}
      {error && (
        <div className="card" style={{ borderColor: 'rgba(255, 23, 68, 0.3)', padding: '12px 20px' }}>
          <span className="text-red" style={{ fontSize: '0.85rem' }}>
            ⚠️ {error}
          </span>
          <button className="btn" onClick={fetchDashboard} style={{ marginLeft: '12px', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* ---- Stats Row ---- */}
      <StatsCards portfolio={portfolio} currentPrice={currentPrice} />

      {/* ---- Main Grid: Chart + Signal ---- */}
      <div className="grid-main">
        {/* Price Chart */}
        <div className="card" id="price-chart-card">
          <div className="card__header">
            <h3 className="card__title">📊 BTC/USDT Price</h3>
            <span className="text-mono fw-700" style={{
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
            }}>
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            <PriceChart candles={candles} currentPrice={currentPrice} />
          </div>
        </div>

        {/* Signal + Indicators */}
        <SignalDisplay signal={currentSignal} indicators={indicators} />
      </div>

      {/* ---- Bottom Grid: Trades + PnL ---- */}
      <div className="grid-bottom">
        <TradeTable trades={portfolio.tradeHistory} />
        <PnlChart trades={portfolio.tradeHistory} initialBalance={portfolio.initialBalance} />
      </div>

      {/* ---- Chat & Backtest ---- */}
      <div className="grid-bottom">
        <BacktestSection />
        <ChatBot />
      </div>

      {/* ---- Footer ---- */}
      <footer style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
        AI Trading Bot · Paper Trading Only · Not Financial Advice · Built with Bun + React
      </footer>
    </div>
  );
}

export default App;
