# Overhaul AI Command Center

AI-powered supply chain risk intelligence platform — predict theft, prevent fraud, and protect high-value cargo before incidents occur.

Built with Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion, Recharts, and React Leaflet.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI configuration (Anthropic / Claude)

The platform runs in two modes:

| | Without API key | With `ANTHROPIC_API_KEY` |
|---|---|---|
| **Copilot chat** | Deterministic mock responses | **Claude Haiku**, streamed, with tool-calling |
| **Executive briefing** | Static recommendations | **Claude Sonnet** reasoning over live portfolio |
| **Incident report** | Template report | **Claude Sonnet** root-cause + recommendations |
| **Route advice** | Static routes | **Claude Sonnet** safer/cheaper/faster options |

To enable real AI, copy `.env.example` to `.env.local` and add your key:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com/).

### Why this model split is efficient

- **Haiku for chat** — cheap and fast for high-volume Q&A.
- **Sonnet only for hard reasoning** — briefings, root-cause, route planning.
- **Tool-calling, not prompt-stuffing** — Claude queries the dataset via tools
  (`get_top_risk_shipments`, `get_fraud_cases`, etc.) in `src/lib/ai/tools.ts`,
  so we never send 500 shipments into a prompt.
- **Numeric risk scoring stays deterministic** — LLMs are not used for math;
  risk/theft scores come from the data layer. In production these would be a
  classical ML model (e.g. gradient-boosted trees), reserving the LLM for language.
- **Graceful fallback** — if a call fails or no key is set, mock logic keeps the demo alive.

## Architecture

```
src/
  app/
    api/            # Mock + AI-backed API routes
      copilot/      # Streaming Claude chat (Haiku)
      executive-briefing/, incident-report/, route-advice/  # Sonnet
      shipments/, carriers/, locations/, fraud/, risk/      # Data APIs
    (pages)/        # Home, platform, copilot, risk, fraud, digital-twin, executive, contact
  components/       # UI, layout, feature components
  lib/
    ai/             # anthropic client, tools, agent loop
    data/           # Seeded demo data generator (500 shipments, 50 carriers, ...)
    mock/           # Deterministic fallback copilot responses
```
