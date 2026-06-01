// ============================================
// Strategy Engine - Black Box Style
// Shared between live trading and backtesting
// ============================================

import type { Candle, IndicatorValues, Signal } from "./types";
import { computeIndicators } from "./indicators";

type StrategyContext = {
  candles: Candle[];
  prevIndicators: IndicatorValues | null;
};

/**
 * Detect basic support/resistance levels from recent candles
 */
function findSupportResistance(candles: Candle[], lookback: number = 50): { support: number; resistance: number } {
  const recent = candles.slice(-lookback);
  const lows = recent.map((c) => c.low);
  const highs = recent.map((c) => c.high);

  return {
    support: Math.min(...lows),
    resistance: Math.max(...highs),
  };
}

/**
 * Core Strategy: Evaluate candles and produce a signal
 * 
 * BUY conditions:
 *  - EMA50 > EMA200 (uptrend)
 *  - RSI < 30 and crossing up (oversold recovery)
 *  - Volume above average
 *  - ADX > 20 (trending, not sideways)
 *  - Price above support
 * 
 * SELL conditions:
 *  - EMA50 < EMA200 (downtrend)
 *  - RSI > 70 and crossing down (overbought reversal)
 *  - ADX > 20
 */
export function evaluateStrategy(ctx: StrategyContext): Signal {
  const { candles, prevIndicators } = ctx;
  const currentCandle = candles[candles.length - 1]!;
  const indicators = computeIndicators(candles);

  const { rsi, ema50, ema200, volumeSMA, adx } = indicators;
  const currentVolume = currentCandle.volume;
  const price = currentCandle.close;
  const prevRSI = prevIndicators?.rsi ?? rsi;

  // Support/Resistance
  const { support } = findSupportResistance(candles);

  const reasons: string[] = [];
  let signalType: "BUY" | "SELL" | "HOLD" = "HOLD";

  // --- Check for trending market (ADX filter) ---
  const isTrending = (adx ?? 25) > 20;

  // --- BUY CONDITIONS ---
  const isUptrend = ema50 > ema200;
  const isRSIOversold = rsi < 30;
  const isRSICrossingUp = prevRSI < 30 && rsi >= 30; // crossing up from oversold
  const isVolumeHigh = currentVolume > volumeSMA * 1.0;
  const isAboveSupport = price > support * 1.005; // 0.5% above support

  if (isUptrend && (isRSIOversold || isRSICrossingUp) && isVolumeHigh && isTrending) {
    signalType = "BUY";
    reasons.push("EMA50 > EMA200 (bullish trend)");
    if (isRSIOversold) reasons.push(`RSI oversold at ${rsi.toFixed(1)}`);
    if (isRSICrossingUp) reasons.push("RSI crossing up from oversold");
    reasons.push("Volume above average");
    if (isTrending) reasons.push(`ADX ${(adx ?? 0).toFixed(1)} indicates trending market`);
    if (isAboveSupport) reasons.push("Price above support level");
  }

  // --- SELL CONDITIONS ---
  const isDowntrend = ema50 < ema200;
  const isRSIOverbought = rsi > 70;
  const isRSICrossingDown = prevRSI > 70 && rsi <= 70; // crossing down from overbought

  if (isDowntrend && (isRSIOverbought || isRSICrossingDown) && isTrending) {
    signalType = "SELL";
    reasons.push("EMA50 < EMA200 (bearish trend)");
    if (isRSIOverbought) reasons.push(`RSI overbought at ${rsi.toFixed(1)}`);
    if (isRSICrossingDown) reasons.push("RSI crossing down from overbought");
    if (isTrending) reasons.push(`ADX ${(adx ?? 0).toFixed(1)} indicates trending market`);
  }

  // --- HOLD (no clear signal) ---
  if (signalType === "HOLD") {
    reasons.push("No clear entry/exit signal");
    if (!isTrending) reasons.push("Market is sideways (low ADX)");
  }

  return {
    type: signalType,
    price,
    timestamp: currentCandle.time,
    reason: reasons.join(" | "),
    indicators,
  };
}
