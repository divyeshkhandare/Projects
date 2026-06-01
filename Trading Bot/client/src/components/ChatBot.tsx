// ============================================
// AI Chatbot Component
// ============================================

import { useState, useRef, useEffect } from "react";
import { api } from "../services/api";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
  timestamp: number;
}

export function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: "👋 Hi! I'm your AI trading assistant. Ask me about your trades, performance, or strategy. Try: \"How am I doing today?\" or \"Why was the last trade taken?\"",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg, timestamp: Date.now() },
    ]);

    setIsLoading(true);

    try {
      const result = await api.chat(userMsg);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: result.response, timestamp: Date.now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ Could not reach the server. Make sure the backend is running.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="card">
      <div className="card__header">
        <h3 className="card__title">🤖 AI Assistant</h3>
      </div>
      <div className="chat">
        <div className="chat__messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat__message chat__message--${msg.role === "user" ? "user" : "bot"}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="chat__message chat__message--bot">
              <div className="loading__spinner" style={{ display: 'inline-block', width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat__input-row">
          <input
            className="chat__input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={'Ask: "Why this trade?" or "Today\'s performance?"'}
            disabled={isLoading}
          />
          <button
            className="chat__send-btn"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
