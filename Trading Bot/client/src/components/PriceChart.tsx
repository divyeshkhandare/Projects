// ============================================
// Price Chart - TradingView Lightweight Charts v5
// ============================================

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, type IChartApi, type SeriesPartialOptions, type CandlestickData, type Time } from "lightweight-charts";
import type { Candle } from "../services/api";

interface PriceChartProps {
  candles: Candle[];
  currentPrice: number;
}

export function PriceChart({ candles, currentPrice }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ReturnType<typeof createCandleSeries> | null>(null);

  function createCandleSeries(chart: IChartApi) {
    return chart.addSeries(CandlestickSeries, {
      upColor: "#00e676",
      downColor: "#ff1744",
      borderDownColor: "#ff1744",
      borderUpColor: "#00e676",
      wickDownColor: "rgba(255, 23, 68, 0.5)",
      wickUpColor: "rgba(0, 230, 118, 0.5)",
    });
  }

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "transparent" },
        textColor: "#8b95a8",
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: "rgba(68, 138, 255, 0.3)", width: 1, style: 2 },
        horzLine: { color: "rgba(68, 138, 255, 0.3)", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = createCandleSeries(chart);

    chartRef.current = chart;
    candleSeriesRef.current = series;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update data when candles change
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    // Deduplicate by timestamp (keep last occurrence) and sort
    const uniqueMap = new Map<number, Candle>();
    for (const c of candles) {
      uniqueMap.set(c.time, c);
    }

    const chartData = Array.from(uniqueMap.values())
      .sort((a, b) => a.time - b.time)
      .map((c) => ({
        time: (c.time / 1000) as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

    try {
      candleSeriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.warn("Chart data error:", err);
    }
  }, [candles]);

  return (
    <div className="chart-container" ref={chartContainerRef} />
  );
}
