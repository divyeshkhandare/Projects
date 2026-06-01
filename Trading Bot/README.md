# AI Trading Bot System

A production-ready trading bot system built with Bun, TypeScript, and React.

## Features
- Real-time Binance WebSocket integration
- Advanced indicator engine (RSI, EMA, ATR, ADX)
- Black-box strategy engine
- Paper trading simulation engine
- Backtesting engine with historical data fetching
- OpenAI-powered trade explanation and chatbot
- Premium dark-themed React dashboard

## Architecture
- `/apps/server`: Bun API & WebSocket server
- `/apps/client`: Vite React Dashboard
- `/packages/core`: Unified business logic
- `/backtest`: Historical simulation engine

## Setup
1. Fill `.env` using `.env.example`
2. `bun install`
3. `cd client && npm install`

## Scripts
- `bun run dev`: Start backend
- `bun run client`: Start dashboard
- `bun run backtest`: Run historical simulation

---
*For educational purposes. Use at your own risk.*
