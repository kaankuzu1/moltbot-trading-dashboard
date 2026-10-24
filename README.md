# MoltBot Trading Dashboard

A view-only dashboard for a crypto portfolio on Binance. It reads balances, prices and history directly from the Binance API through server-side proxy routes. There is no database, no login and no trading functionality. The UI is in Turkish.

## Background

This dashboard was built to monitor MoltBot, a personal automated trading bot I ran on my own Binance account.

- **The bot:** a Python, rule-based trading system that bought and sold on Binance Spot when predefined conditions were met, under fixed trade limits. I wrote most of it, with AI assistance (Claude Code). I tested many variants of the approach with backtests before settling on the rules.
- **Run:** about 3-4 months with real capital of roughly 200-300 USD.
- **Status:** the bot has been stopped and its code deleted, so it is not part of this repository. I did not keep a verified performance record, so I make no performance claims.
- **This repo:** the dashboard I built to watch the account: portfolio value over time, allocation, per-coin cards with take-profit / stop-loss levels, and trade history. It never places orders.

## Features

- **Statistics** (`/statistics`): KPI cards, portfolio value chart (1H / 2H / 1A) built from Binance daily account snapshots, allocation donut chart, deposit/withdrawal totals, BTC price and Fear & Greed Index
- **Assets** (`/varliklar`): one card per held coin with 24h change, 7-day sparkline, amount, value, and take-profit / stop-loss levels detected from open orders (including OCO/OTO/OTOCO groups); sortable
- **Trades** (`/islemler`): recent buy/sell history (last 30 days), color-coded
- **Wallets:** a landing page at `/` picks a wallet. Each wallet is a fixed percentage share of the account, defined in `lib/wallets.ts` and applied to dollar amounts and coin quantities (never to prices or percentages). Card themes are stored in the browser's `localStorage`.
- **Refresh:** data is polled with SWR (account 60 s, market 5 min, history and klines 1 h, trades 2 min); a refresh button revalidates everything with a 30 s cooldown

## Tech stack

- Next.js 16 (App Router, TypeScript), React 19
- Tailwind CSS v4 + shadcn/ui, Recharts, SWR
- Binance Spot read API (HMAC-signed requests), alternative.me for Fear & Greed
- Deployed on Vercel

## Setup

```bash
npm install
```

Create `.env.local` with a read-only Binance API key:

```env
BINANCE_API_KEY=...
BINANCE_API_SECRET=...
```

```bash
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

There is no test framework configured.

## API routes

All routes are GET proxies under `app/api/binance/` and keep the API key on the server: `account`, `market`, `history`, `klines`, `trades`, `capital-flow`. They use the Edge Runtime because Binance blocks the IP ranges of Vercel's Node serverless functions.
