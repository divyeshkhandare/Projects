// ============================================
// Trade History Table
// ============================================

import type { Trade } from "../services/api";

interface TradeTableProps {
  trades: Trade[];
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TradeTable({ trades }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">📋 Trade History</h3>
        </div>
        <div className="card__body">
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <div className="empty-state__text">No trades yet. Waiting for signals...</div>
          </div>
        </div>
      </div>
    );
  }

  const sortedTrades = [...trades].reverse();

  return (
    <div className="card">
      <div className="card__header">
        <h3 className="card__title">📋 Trade History</h3>
        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
          {trades.length} trade{trades.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>PnL</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade) => (
              <tr key={trade.id}>
                <td className="text-muted">{trade.id}</td>
                <td>
                  <span className={`signal-badge signal-badge--${trade.type.toLowerCase()}`}>
                    {trade.type}
                  </span>
                </td>
                <td className="text-mono fw-600">${trade.entryPrice.toFixed(2)}</td>
                <td className="text-mono fw-600">
                  {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "—"}
                </td>
                <td className={`text-mono fw-700 ${(trade.pnl ?? 0) >= 0 ? 'text-green' : 'text-red'}`}>
                  {trade.pnl !== undefined ? (
                    <>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      <span className="text-muted" style={{ fontSize: '0.7rem', marginLeft: '4px' }}>
                        ({trade.pnlPercent?.toFixed(1)}%)
                      </span>
                    </>
                  ) : "—"}
                </td>
                <td>
                  <span className={`signal-badge ${trade.status === 'OPEN' ? 'signal-badge--buy' : 'signal-badge--hold'}`}
                    style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
                    {trade.status}
                  </span>
                </td>
                <td className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {formatTime(trade.entryTime)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
