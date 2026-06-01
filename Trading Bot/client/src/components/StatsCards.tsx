// ============================================
// Stats Cards - Top-level KPIs
// ============================================

import type { PortfolioState } from "../services/api";

interface StatsCardsProps {
  portfolio: PortfolioState;
  currentPrice: number;
}

export function StatsCards({ portfolio, currentPrice }: StatsCardsProps) {
  const pnlClass = portfolio.totalPnl >= 0 ? "stat-card__value--positive" : "stat-card__value--negative";
  const pnlSign = portfolio.totalPnl >= 0 ? "+" : "";
  const pnlPercent = ((portfolio.totalPnl / portfolio.initialBalance) * 100).toFixed(2);

  return (
    <div className="grid-stats">
      {/* Balance */}
      <div className="stat-card">
        <div className="stat-card__label">
          💰 Balance
        </div>
        <div className={`stat-card__value ${pnlClass}`}>
          ${portfolio.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`stat-card__change ${portfolio.totalPnl >= 0 ? 'text-green' : 'text-red'}`}>
          {pnlSign}${portfolio.totalPnl.toFixed(2)} ({pnlSign}{pnlPercent}%)
        </div>
      </div>

      {/* Current Price */}
      <div className="stat-card">
        <div className="stat-card__label">
          📊 BTC Price
        </div>
        <div className="stat-card__value">
          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="stat-card__change text-muted">
          Live Market
        </div>
      </div>

      {/* Win Rate */}
      <div className="stat-card">
        <div className="stat-card__label">
          🎯 Win Rate
        </div>
        <div className="stat-card__value text-blue">
          {portfolio.winRate.toFixed(1)}%
        </div>
        <div className="stat-card__change text-muted">
          {portfolio.wins}W / {portfolio.losses}L ({portfolio.totalTrades} total)
        </div>
      </div>

      {/* Max Drawdown */}
      <div className="stat-card">
        <div className="stat-card__label">
          📉 Max Drawdown
        </div>
        <div className="stat-card__value stat-card__value--negative">
          {portfolio.maxDrawdown.toFixed(2)}%
        </div>
        <div className="stat-card__change text-muted">
          From peak balance
        </div>
      </div>

      {/* Open Position */}
      <div className="stat-card">
        <div className="stat-card__label">
          📌 Position
        </div>
        <div className="stat-card__value" style={{ fontSize: '1.1rem' }}>
          {portfolio.openTrade ? (
            <span className="text-green">
              LONG @ ${portfolio.openTrade.entryPrice.toFixed(2)}
            </span>
          ) : (
            <span className="text-muted">No Position</span>
          )}
        </div>
        {portfolio.openTrade && (
          <div className="stat-card__change text-muted">
            SL: ${portfolio.openTrade.stopLoss.toFixed(2)} | TP: ${portfolio.openTrade.takeProfit.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
