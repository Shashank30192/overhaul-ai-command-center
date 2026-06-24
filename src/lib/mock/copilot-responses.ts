import type { ChatMessage } from "@/lib/types";
import { demoData, getDelayedShipments, getFraudCasesThisWeek, getTopRiskShipments } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const EXAMPLE_CONVERSATIONS: { title: string; messages: ChatMessage[] }[] = [
  {
    title: "Highest theft risk",
    messages: [
      { id: "1", role: "user", content: "Which shipment has highest theft risk?", timestamp: new Date().toISOString() },
      { id: "2", role: "assistant", content: "", timestamp: new Date().toISOString() },
    ],
  },
  {
    title: "Delayed shipments",
    messages: [
      { id: "1", role: "user", content: "Show delayed shipments.", timestamp: new Date().toISOString() },
      { id: "2", role: "assistant", content: "", timestamp: new Date().toISOString() },
    ],
  },
];

export function getCopilotResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("highest") && q.includes("theft")) {
    const top = getTopRiskShipments(1)[0];
    return `**Highest Theft Risk Shipment: ${top.id}**

| Field | Value |
|-------|-------|
| Cargo | ${top.cargo} |
| Value | ${formatCurrency(top.cargoValue)} |
| Route | ${top.origin} → ${top.destination} |
| Risk Score | **${top.riskScore}%** |
| Theft Probability | **${top.theftProbability}%** |

**Risk Factors:**
${top.riskReasons.map((r) => `• ${r}`).join("\n")}

**Recommended Action:** ${top.recommendedAction}

Carrier: ${top.carrierName} | Status: ${top.status.replace("_", " ")}`;
  }

  if (q.includes("delayed")) {
    const delayed = getDelayedShipments().slice(0, 5);
    return `**${delayed.length} Delayed Shipments** (showing top 5)

${delayed
  .map(
    (s) =>
      `**${s.id}** — ${s.cargo} (${formatCurrency(s.cargoValue)})
Route: ${s.origin} → ${s.destination}
Delay: ${s.delayHours}h | Risk: ${s.riskScore}% | Carrier: ${s.carrierName}`
  )
  .join("\n\n")}

*AI Recommendation:* Prioritize ${delayed[0]?.id} for rerouting — highest value at risk during extended delay.`;
  }

  if (q.includes("fraud") && q.includes("week")) {
    const cases = getFraudCasesThisWeek();
    return `**${cases.length} Fraud Cases This Week**

${cases
  .slice(0, 5)
  .map(
    (f) =>
      `**${f.id}** — ${f.type.replace(/_/g, " ")}
Shipment: ${f.shipmentId} | Score: ${f.fraudScore}%
Carrier: ${f.carrierName} | Exposure: ${formatCurrency(f.financialExposure)}
Status: ${f.status}`
  )
  .join("\n\n")}

Total financial exposure: **${formatCurrency(cases.reduce((s, c) => s + c.financialExposure, 0))}**`;
  }

  if (q.includes("route") && q.includes("avoid")) {
    return `**Routes to Avoid — AI Analysis**

🔴 **I-95 Corridor (NJ-MD)** — 3 cargo thefts in past 14 days. Risk score: 91%
🔴 **TX-35 near Laredo** — Border delay + fraud cluster. Risk score: 87%
🟠 **CA-99 Fresno segment** — Organized theft ring activity. Risk score: 78%
🟠 **I-40 Memphis-Dallas** — Weather + crime compound risk. Risk score: 74%

**Safer Alternatives:**
• I-81 → I-64 corridor (risk reduction: -42%)
• I-10 western route via El Paso (risk reduction: -35%)
• Rail intermodal via Chicago hub (risk reduction: -28%, +18h transit)`;
  }

  if (q.includes("executive") || q.includes("summary")) {
    const stats = demoData.executiveStats;
    const topRisks = getTopRiskShipments(3);
    return `**Executive Summary — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}**

**Portfolio Overview**
• Cargo Protected: ${formatCurrency(stats.cargoProtected)}
• Active Shipments: ${stats.activeShipments.toLocaleString()}
• Risks Prevented (MTD): ${stats.risksPrevented}
• Fraud Cases Stopped: ${stats.fraudCasesStopped}

**Top 3 Risk Exposures**
${topRisks.map((s, i) => `${i + 1}. ${s.id} — ${s.cargo} (${formatCurrency(s.cargoValue)}) — ${s.riskScore}% risk`).join("\n")}

**Key Recommendations**
1. Deploy security escorts on 4 critical shipments (>85% risk)
2. Suspend 2 carriers pending fraud investigation
3. Reroute 12 shipments away from I-95 corridor
4. Activate cold chain monitoring on 8 pharmaceutical loads

**Financial Impact:** ${formatCurrency(stats.insuranceSavings)} insurance savings YTD | ${stats.riskReduction}% risk reduction`;
  }

  if (q.includes("cold chain") || q.includes("temperature")) {
    const incidents = demoData.coldChainIncidents.filter((c) => c.predictedExcursion).slice(0, 3);
    return `**Cold Chain Temperature Alerts**

${incidents
  .map(
    (c) =>
      `**${c.shipmentId}** — ${c.cargo}
Current: ${c.currentTemp.toFixed(1)}°C | Threshold: ${c.threshold}°C
Excursion Probability: **${c.probability}%**`
  )
  .join("\n\n")}

*AI predicts 3 temperature excursions within next 6 hours. Pre-cooling adjustment recommended.*`;
  }

  if (q.includes("insurance") || q.includes("claim")) {
    return `**Insurance Claim Probability Analysis**

| Shipment | Cargo Value | Claim Probability |
|----------|-------------|-------------------|
| TX-45872 | $1.2M | **78%** |
| LA-92341 | $890K | **62%** |
| CH-11203 | $2.1M | **45%** |

Average claim probability across at-risk portfolio: **34%**
Estimated total exposure: **$4.2M**
Recommended: Pre-file documentation for TX-45872`;
  }

  if (q.includes("security") || q.includes("escort")) {
    const highRisk = getTopRiskShipments(3);
    return `**Security Escort Recommendations**

${highRisk
  .map(
    (s) =>
      `🛡️ **${s.id}** — ${formatCurrency(s.cargoValue)} ${s.cargo}
Escort Type: Armed convoy | ETA to intercept: 45 min
Risk reduction: -${Math.round(s.riskScore * 0.6)}%`
  )
  .join("\n\n")}

Estimated escort cost: $12,400 | Cargo value protected: ${formatCurrency(highRisk.reduce((a, s) => a + s.cargoValue, 0))}`;
  }

  return `I can help you with supply chain risk intelligence. Try asking:

• "Which shipment has highest theft risk?"
• "Show delayed shipments"
• "What fraud cases occurred this week?"
• "Which routes should be avoided?"
• "Generate executive summary"
• "Predict cold chain temperature excursions"
• "Estimate insurance claim probability"
• "Recommend security escorts"

I have real-time access to **${demoData.shipments.length} shipments**, **${demoData.carriers.length} carriers**, and **${demoData.fraudCases.length} active fraud investigations**.`;
}
