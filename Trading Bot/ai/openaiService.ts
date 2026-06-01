// ============================================
// AI Module - OpenAI Integration
// Trade explanations + Chatbot
// ============================================

import type { Signal, PortfolioState, Trade } from "../packages/core/types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Call OpenAI Chat Completion API
 */
async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    return "[AI unavailable - no API key configured]";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return "[AI error - check API key]";
    }

    const data = (await response.json()) as any;
    return data.choices?.[0]?.message?.content ?? "[No response]";
  } catch (err) {
    console.error("OpenAI request failed:", err);
    return "[AI request failed]";
  }
}

/**
 * Generate a human-readable explanation for a trade signal
 */
export async function explainSignal(signal: Signal): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a professional quantitative trading analyst. Explain trading signals in clear, concise language. Keep explanations under 3 sentences. Be specific about the technical indicators and what they mean.`,
    },
    {
      role: "user",
      content: `Explain this trading signal:
Signal: ${signal.type}
Price: $${signal.price.toFixed(2)}
Reason: ${signal.reason}
RSI: ${signal.indicators?.rsi?.toFixed(1) ?? "N/A"}
EMA50: ${signal.indicators?.ema50?.toFixed(2) ?? "N/A"}
EMA200: ${signal.indicators?.ema200?.toFixed(2) ?? "N/A"}
ATR: ${signal.indicators?.atr?.toFixed(2) ?? "N/A"}
ADX: ${signal.indicators?.adx?.toFixed(1) ?? "N/A"}`,
    },
  ];

  return callOpenAI(messages);
}

/**
 * Trading chatbot - answer user questions about trades and performance
 */
export async function chatWithBot(
  userMessage: string,
  portfolio: PortfolioState,
  recentSignal: Signal | null
): Promise<string> {
  const portfolioContext = `
Current Balance: $${portfolio.balance.toFixed(2)}
Initial Balance: $${portfolio.initialBalance.toFixed(2)}
Total PnL: $${portfolio.totalPnl.toFixed(2)}
Win Rate: ${portfolio.winRate.toFixed(1)}%
Total Trades: ${portfolio.totalTrades}
Wins: ${portfolio.wins} | Losses: ${portfolio.losses}
Max Drawdown: ${portfolio.maxDrawdown.toFixed(2)}%
Open Position: ${portfolio.openTrade ? `BUY @ $${portfolio.openTrade.entryPrice.toFixed(2)}` : "None"}
Recent trades: ${portfolio.tradeHistory
    .slice(-5)
    .map((t) => `${t.type} @ $${t.entryPrice.toFixed(2)} → $${t.exitPrice?.toFixed(2) ?? "open"} (PnL: $${t.pnl?.toFixed(2) ?? "N/A"})`)
    .join("; ")}
`;

  const signalContext = recentSignal
    ? `Latest Signal: ${recentSignal.type} @ $${recentSignal.price.toFixed(2)} - ${recentSignal.reason}`
    : "No recent signal";

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are an AI trading assistant for a paper trading bot. You have access to the following portfolio data:

${portfolioContext}

${signalContext}

Answer the user's questions about their trading performance, current positions, and strategy. Be concise and helpful. If asked about specific trades, reference the data above. If asked about strategy, explain the EMA crossover + RSI strategy being used.`,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  return callOpenAI(messages);
}
