// ============================================
// Backtest UI Component
// Allows running historical simulations from the dashboard
// ============================================

import { useState } from "react";
import { api, type BacktestResult } from "../services/api";

export function BacktestSection() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [limit, setLimit] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.runBacktest(symbol, limit);
      setResult(data);
    } catch (err) {
      setError("Failed to run backtest. Check if server is responding.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" id="backtest-card">
      <div className="card__header">
        <h3 className="card__title">🔬 Strategy Backtester</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <select 
            className="chat__input" 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
            style={{ width: "120px", padding: "4px 8px" }}
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
          </select>
          <input 
            type="number" 
            className="chat__input" 
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            placeholder="Candles"
            style={{ width: "80px", padding: "4px 8px" }}
          />
          <button 
            className="btn btn--primary" 
            onClick={runBacktest}
            disabled={isLoading}
            style={{ padding: "4px 12px" }}
          >
            {isLoading ? "Running..." : "Run"}
          </button>
        </div>
      </div>
      <div className="card__body">
        {error && <div className="text-red" style={{ marginBottom: "12px", fontSize: "0.8rem" }}>⚠️ {error}</div>}
        
        {!result && !isLoading && (
          <div className="empty-state">
            <div className="empty-state__icon">🧪</div>
            <div className="empty-state__text">Select parameters and click Run to simulate strategy on historical data.</div>
          </div>
        )}

        {isLoading && (
          <div className="loading">
            <div className="loading__spinner"></div>
            Analyzing historical data...
          </div>
        )}

        {result && (
          <div className="backtest-results">
            <div className="grid-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "20px" }}>
              <div className="indicator-item">
                <div className="indicator-item__label">Win Rate</div>
                <div className="indicator-item__value text-blue">{result.winRate.toFixed(1)}%</div>
              </div>
              <div className="indicator-item">
                <div className="indicator-item__label">Net Profit</div>
                <div className={`indicator-item__value ${result.netProfit >= 0 ? "text-green" : "text-red"}`}>
                  {result.netProfit >= 0 ? "+" : ""}{result.netProfitPercent.toFixed(2)}%
                </div>
              </div>
              <div className="indicator-item">
                <div className="indicator-item__label">Max Drawdown</div>
                <div className="indicator-item__value text-red">{result.maxDrawdownPercent.toFixed(2)}%</div>
              </div>
            </div>

            <div className="table-container" style={{ maxHeight: "200px" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Entry</th>
                    <th>Exit</th>
                    <th>PnL%</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.slice(-20).map((t, i) => (
                    <tr key={i}>
                      <td>{t.type}</td>
                      <td>${t.entryPrice.toFixed(1)}</td>
                      <td>${t.exitPrice?.toFixed(1)}</td>
                      <td className={(t.pnlPercent ?? 0) >= 0 ? "text-green" : "text-red"}>
                        {t.pnlPercent?.toFixed(2)}%
                      </td>
                      <td>{(t.pnl ?? 0) > 0 ? "✅" : "❌"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-muted" style={{ fontSize: "0.7rem", marginTop: "12px", textAlign: "right" }}>
              Showing last 20 of {result.totalTrades} historical trades
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
