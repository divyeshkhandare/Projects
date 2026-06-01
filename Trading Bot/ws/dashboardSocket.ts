// ============================================
// WebSocket Server - Real-time updates to frontend
// ============================================

import type { DashboardData, Signal, PortfolioState, Candle, IndicatorValues } from "../packages/core/types";

type WSClient = {
  ws: any; // Bun WebSocket type
  id: string;
};

const clients: Map<string, WSClient> = new Map();
let clientCounter = 0;

/**
 * Handle WebSocket upgrade and connections
 */
export function createWSHandler() {
  return {
    open(ws: any) {
      const id = `client_${++clientCounter}`;
      clients.set(id, { ws, id });
      (ws as any).__clientId = id;
      console.log(`🔗 Dashboard client connected (${clients.size} total)`);
    },

    message(ws: any, message: string | Buffer) {
      // Handle incoming messages from dashboard (e.g., chat)
      try {
        const data = JSON.parse(typeof message === "string" ? message : message.toString());
        console.log("📨 Client message:", data);
      } catch {
        // ignore invalid messages
      }
    },

    close(ws: any) {
      const id = (ws as any).__clientId;
      if (id) clients.delete(id);
      console.log(`🔌 Dashboard client disconnected (${clients.size} total)`);
    },
  };
}

/**
 * Broadcast data to all connected dashboard clients
 */
export function broadcastToClients(event: string, data: unknown) {
  const message = JSON.stringify({ event, data, timestamp: Date.now() });

  for (const [id, client] of clients) {
    try {
      client.ws.send(message);
    } catch {
      clients.delete(id);
    }
  }
}

/**
 * Broadcast a new signal
 */
export function broadcastSignal(signal: Signal) {
  broadcastToClients("signal", signal);
}

/**
 * Broadcast portfolio update
 */
export function broadcastPortfolio(state: PortfolioState) {
  broadcastToClients("portfolio", state);
}

/**
 * Broadcast price update
 */
export function broadcastPrice(price: number, candle?: Candle) {
  broadcastToClients("price", { price, candle });
}

/**
 * Broadcast indicator values
 */
export function broadcastIndicators(indicators: IndicatorValues) {
  broadcastToClients("indicators", indicators);
}
