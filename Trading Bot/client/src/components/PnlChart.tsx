// ============================================
// PnL Chart - Equity curve visualization
// ============================================

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { Trade } from "../services/api";

interface PnlChartProps {
  trades: Trade[];
  initialBalance: number;
}

export function PnlChart({ trades, initialBalance }: PnlChartProps) {
  if (trades.length === 0) {
    return (
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">📈 PnL Performance</h3>
        </div>
        <div className="card__body">
          <div className="empty-state">
            <div className="empty-state__icon">📊</div>
            <div className="empty-state__text">PnL chart will appear after trades</div>
          </div>
        </div>
      </div>
    );
  }

  // Build equity curve from trades
  const closedTrades = trades.filter((t) => t.status === "CLOSED" && t.pnl !== undefined);
  let runningBalance = initialBalance;

  const data = [
    { trade: 0, balance: initialBalance, pnl: 0 },
    ...closedTrades.map((t, i) => {
      runningBalance += t.pnl!;
      return {
        trade: i + 1,
        balance: parseFloat(runningBalance.toFixed(2)),
        pnl: parseFloat(t.pnl!.toFixed(2)),
      };
    }),
  ];

  const minBalance = Math.min(...data.map((d) => d.balance));
  const maxBalance = Math.max(...data.map((d) => d.balance));
  const isProfit = runningBalance >= initialBalance;

  return (
    <div className="card">
      <div className="card__header">
        <h3 className="card__title">📈 PnL Performance</h3>
        <span className={isProfit ? 'text-green fw-600' : 'text-red fw-600'} style={{ fontSize: '0.85rem' }}>
          {isProfit ? '+' : ''}${(runningBalance - initialBalance).toFixed(2)}
        </span>
      </div>
      <div className="card__body">
        <div className="pnl-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isProfit ? "#00e676" : "#ff1744"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isProfit ? "#00e676" : "#ff1744"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="trade"
                stroke="#5a6478"
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              />
              <YAxis
                domain={[minBalance * 0.998, maxBalance * 1.002]}
                stroke="#5a6478"
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1f2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#e8ecf4',
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name === 'balance' ? 'Balance' : 'Trade PnL',
                ]}
                labelFormatter={(label) => `Trade #${label}`}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={isProfit ? "#00e676" : "#ff1744"}
                strokeWidth={2}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
