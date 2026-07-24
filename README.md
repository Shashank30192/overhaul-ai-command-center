# Overhaul AI Command Center

AI-powered supply chain risk intelligence platform — predict theft, prevent fraud, and protect high-value cargo before incidents occur.

Built with **Next.js 16** (App Router), **React 19**, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, and React Leaflet.

## Features

| Route | What it does |
|-------|----------------|
| `/` | Landing + dashboard preview |
| `/platform` | Platform overview |
| `/control-tower` | Live shipment control tower |
| `/copilot` | AI copilot chat (Claude / mock) |
| `/risk` | Risk monitor, heatmap, RiskGPT |
| `/fraud` / `/fraud-watch` | Fraud cases & FraudWatch onboarding |
| `/digital-twin` | Map-based digital twin |
| `/executive` | Executive briefing & charts |
| `/agent` | Autonomous agent command center |
| `/self-service` | Self-service resolution workflows |
| `/contact` | Contact |

## Project structure

```
overhaul-ai-command-center/
├── public/                 # Static assets
├── src/
│   ├── app/                # App Router pages + API routes
│   │   ├── api/            # Mock + AI-backed endpoints
│   │   │   ├── copilot/    # Streaming Claude chat (Haiku)
│   │   │   ├── executive-briefing/, incident-report/, route-advice/
│   │   │   ├── riskgpt/, self-service-agent/, agent/
│   │   │   └── shipments/, carriers/, locations/, fraud/, risk/
│   │   ├── control-tower/, risk/, fraud/, digital-twin/, …
│   │   └── page.tsx        # Home
│   ├── components/         # UI by domain (control-tower, risk, fraud, …)
│   └── lib/
│       ├── ai/             # Anthropic / Groq clients, tools, agent loop
│       ├── data/           # Seeded demo data (shipments, carriers, …)
│       └── mock/           # Deterministic fallbacks when no API key
├── .env.example            # Env template (copy → .env.local)
├── INSTALL.md              # Detailed setup / troubleshooting
├── package.json
└── README.md
```

## Getting started

**Prerequisites:** Node.js 20+ and npm 10+.

```bash
cd overhaul-ai-command-center
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm run start
```

See [INSTALL.md](./INSTALL.md) for Windows platform fixes, port conflicts, and more.

## AI configuration

The app runs **without any API key** using mock responses. Optional keys unlock live models:

| Feature | Without key | With key |
|---------|-------------|----------|
| **Copilot chat** | Deterministic mocks | **Claude Haiku**, streamed, tool-calling (`ANTHROPIC_API_KEY`) |
| **Executive briefing** | Static recommendations | **Claude Sonnet** over live portfolio |
| **Incident report** | Template report | **Claude Sonnet** root-cause + recommendations |
| **Route advice** | Static routes | **Claude Sonnet** safer / cheaper / faster options |
| **Some agent flows** | Mocks | **Groq** Llama (`GROQ_API_KEY`, optional) |

```bash
cp .env.example .env.local
```

Then set:

```bash
ANTHROPIC_API_KEY=sk-ant-...
# optional
GROQ_API_KEY=gsk_...
```

Get an Anthropic key at [console.anthropic.com](https://console.anthropic.com/).

Never commit `.env.local` — it is git-ignored.

### Why this model split is efficient

- **Haiku for chat** — cheap and fast for high-volume Q&A.
- **Sonnet only for hard reasoning** — briefings, root-cause, route planning.
- **Tool-calling, not prompt-stuffing** — Claude queries the dataset via tools in `src/lib/ai/tools.ts` (`get_top_risk_shipments`, `get_fraud_cases`, etc.), so we never stuff hundreds of shipments into a prompt.
- **Numeric risk scoring stays deterministic** — LLMs are not used for math; risk/theft scores come from the data layer.
- **Graceful fallback** — if a call fails or no key is set, mock logic keeps the demo alive.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## License

Private prototype — all rights reserved.
