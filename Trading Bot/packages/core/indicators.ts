// ============================================
// Indicator Engine - Pure functions, no side effects
// Shared between live trading and backtesting
// ============================================

import type { Candle, IndicatorValues } from "./types";

/**
 * Calculate RSI (Relative Strength Index)
 * @param closes - Array of closing prices
 * @param period - RSI period (default 14)
 */
export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50; // neutral default

  let gains = 0;
  let losses = 0;

  // Initial average gain/loss
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i]! - closes[i - 1]!;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Calculate EMA (Exponential Moving Average)
 * @param closes - Array of closing prices
 * @param period - EMA period
 */
export function calculateEMA(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1] ?? 0;

  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first "period" values
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += closes[i]!;
  }
  ema /= period;

  // Apply EMA formula for remaining values
  for (let i = period; i < closes.length; i++) {
    ema = (closes[i]! - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate ATR (Average True Range)
 * @param candles - Array of candle data
 * @param period - ATR period (default 14)
 */
export function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length < period + 1) return 0;

  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i]!.high;
    const low = candles[i]!.low;
    const prevClose = candles[i - 1]!.close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  // Simple average of last `period` true ranges
  const recentTRs = trueRanges.slice(-period);
  return recentTRs.reduce((sum, tr) => sum + tr, 0) / recentTRs.length;
}

/**
 * Calculate Volume SMA
 * @param volumes - Array of volumes
 * @param period - SMA period (default 20)
 */
export function calculateVolumeSMA(volumes: number[], period: number = 20): number {
  if (volumes.length < period) {
    return volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
  }

  const recentVolumes = volumes.slice(-period);
  return recentVolumes.reduce((sum, v) => sum + v, 0) / period;
}

/**
 * Calculate ADX (Average Directional Index) - simplified
 * @param candles - Array of candle data
 * @param period - ADX period (default 14)
 */
export function calculateADX(candles: Candle[], period: number = 14): number {
  if (candles.length < period * 2 + 1) return 25; // neutral default

  const plusDMs: number[] = [];
  const minusDMs: number[] = [];
  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i]!.high;
    const low = candles[i]!.low;
    const prevHigh = candles[i - 1]!.high;
    const prevLow = candles[i - 1]!.low;
    const prevClose = candles[i - 1]!.close;

    const plusDM = high - prevHigh > prevLow - low ? Math.max(high - prevHigh, 0) : 0;
    const minusDM = prevLow - low > high - prevHigh ? Math.max(prevLow - low, 0) : 0;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));

    plusDMs.push(plusDM);
    minusDMs.push(minusDM);
    trueRanges.push(tr);
  }

  // Smoothed averages
  const smoothedPlusDM = plusDMs.slice(-period).reduce((s, v) => s + v, 0) / period;
  const smoothedMinusDM = minusDMs.slice(-period).reduce((s, v) => s + v, 0) / period;
  const smoothedTR = trueRanges.slice(-period).reduce((s, v) => s + v, 0) / period;

  if (smoothedTR === 0) return 0;

  const plusDI = (smoothedPlusDM / smoothedTR) * 100;
  const minusDI = (smoothedMinusDM / smoothedTR) * 100;

  if (plusDI + minusDI === 0) return 0;

  const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100;
  return dx;
}

/**
 * Compute all indicators from candle history
 * @param candles - Array of closed candles
 */
export function computeIndicators(candles: Candle[]): IndicatorValues {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);

  return {
    rsi: calculateRSI(closes, 14),
    ema50: calculateEMA(closes, 50),
    ema200: calculateEMA(closes, 200),
    atr: calculateATR(candles, 14),
    volumeSMA: calculateVolumeSMA(volumes, 20),
    adx: calculateADX(candles, 14),
  };
}
