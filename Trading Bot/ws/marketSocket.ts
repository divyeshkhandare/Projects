// ============================================
// Enhanced WebSocket - Market Data with reconnection
// ============================================

import type { Candle } from "../packages/core/types";

type CandleHandler = (candle: Candle) => void;

export class MarketSocket {
  private ws: WebSocket | null = null;
  private symbol: string;
  private handlers: CandleHandler[] = [];
  private reconnectDelay = 3000;
  private maxReconnectDelay = 30000;
  private isConnected = false;
  private currentPrice = 0;

  constructor(symbol: string = "btcusdt") {
    this.symbol = symbol.toLowerCase();
    this.connect();
  }

  private connect() {
    const stream = `${this.symbol}@kline_1m`;
    const url = `wss://stream.binance.com:9443/ws/${stream}`;

    console.log(`🔌 Connecting to Binance WebSocket (${this.symbol})...`);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("✅ Connected to Binance WebSocket");
      this.isConnected = true;
      this.reconnectDelay = 3000; // reset on successful connection
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        const k = data.k;

        if (!k) return;

        const candle: Candle = {
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
          isClosed: k.x,
          time: k.t,
        };

        this.currentPrice = candle.close;

        // Only process closed candles for strategy
        if (candle.isClosed) {
          console.log(`📊 Closed Candle: ${candle.close.toFixed(2)} | Vol: ${candle.volume.toFixed(2)}`);
          this.handlers.forEach((handler) => handler(candle));
        }
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", err);
      }
    };

    this.ws.onerror = (err) => {
      console.error("❌ WebSocket Error:", err);
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      console.log(`🔌 WebSocket closed. Reconnecting in ${this.reconnectDelay / 1000}s...`);

      setTimeout(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
        this.connect();
      }, this.reconnectDelay);
    };
  }

  /** Register a handler for closed candles */
  onCandle(handler: CandleHandler) {
    this.handlers.push(handler);
  }

  /** Get current live price */
  getCurrentPrice(): number {
    return this.currentPrice;
  }

  /** Check connection status */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /** Close connection */
  close() {
    if (this.ws) {
      this.ws.onclose = null; // prevent reconnect
      this.ws.close();
      this.isConnected = false;
    }
  }
}