// ============================================
// Signal Display - Current trading signal
// ============================================

import type { Signal, IndicatorValues } from "../services/api";

interface SignalDisplayProps {
  signal: Signal | null;
  indicators: IndicatorValues | null;
}

export function SignalDisplay({ signal, indicators }: SignalDisplayProps) {
  if (!signal) {
    return (
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">⚡ Current Signal</h3>
        </div>
        <div className="card__body">
          <div className="empty-state">
            <div className="empty-state__icon">📡</div>
            <div className="empty-state__text">Waiting for market data...</div>
          </div>
        </div>
      </div>
    );
  }

  const typeClass = `signal-display__type--${signal.type.toLowerCase()}`;

  return (
    <div className="card">
      <div className="card__header">
        <h3 className="card__title">⚡ Current Signal</h3>
        <span className={`signal-badge signal-badge--${signal.type.toLowerCase()}`}>
          {signal.type}
        </span>
      </div>
      <div className="card__body">
        <div className="signal-display">
          <div className={`signal-display__type ${typeClass}`}>
            {signal.type}
          </div>
          <div className="signal-display__price">
            ${signal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="signal-display__reason">
            {signal.reason}
          </div>
          {signal.aiExplanation && (
            <div className="signal-display__reason" style={{ marginTop: '12px', color: 'var(--accent-blue)' }}>
              🤖 {signal.aiExplanation}
            </div>
          )}
        </div>

        {/* Indicator Values */}
        {indicators && (
          <>
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px -20px 0', padding: '16px 20px 0' }}>
              <div className="indicators-grid">
                <div className="indicator-item">
                  <div className="indicator-item__label">RSI (14)</div>
                  <div className="indicator-item__value" style={{
                    color: indicators.rsi < 30 ? 'var(--accent-green)' :
                           indicators.rsi > 70 ? 'var(--accent-red)' :
                           'var(--text-primary)'
                  }}>
                    {indicators.rsi.toFixed(1)}
                  </div>
                </div>
                <div className="indicator-item">
                  <div className="indicator-item__label">EMA 50</div>
                  <div className="indicator-item__value">
                    ${indicators.ema50.toFixed(2)}
                  </div>
                </div>
                <div className="indicator-item">
                  <div className="indicator-item__label">EMA 200</div>
                  <div className="indicator-item__value">
                    ${indicators.ema200.toFixed(2)}
                  </div>
                </div>
                <div className="indicator-item">
                  <div className="indicator-item__label">ATR (14)</div>
                  <div className="indicator-item__value">
                    {indicators.atr.toFixed(2)}
                  </div>
                </div>
                <div className="indicator-item">
                  <div className="indicator-item__label">Vol SMA</div>
                  <div className="indicator-item__value">
                    {indicators.volumeSMA.toFixed(0)}
                  </div>
                </div>
                <div className="indicator-item">
                  <div className="indicator-item__label">ADX</div>
                  <div className="indicator-item__value" style={{
                    color: (indicators.adx ?? 0) > 25 ? 'var(--accent-green)' : 'var(--accent-amber)'
                  }}>
                    {(indicators.adx ?? 0).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
