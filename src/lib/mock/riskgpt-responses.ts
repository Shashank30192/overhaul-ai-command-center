import type { Shipment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export const RISKGPT_SYSTEM_PROMPT = `You are RiskGPT — an AI risk analyst embedded in the Overhaul Risk Monitor dashboard.

You analyze active shipments for theft risk, route safety, fraud signals, and recommended interventions.

Guidelines:
- Be concise and operational — bullet points, short paragraphs.
- Ground every answer in the shipment context provided. Never invent IDs or numbers not in the context.
- Always end with a clear recommended action.
- Use markdown sparingly: **bold** for emphasis, bullet lists for steps.
- If asked about waiving events or TTS, explain tradeoffs and security implications.`;

export function buildShipmentContext(shipment: Shipment): string {
  return `Active shipment context:
- ID: ${shipment.id}
- Status: ${shipment.status.replace(/_/g, " ")}
- Route: ${shipment.origin} → ${shipment.destination}
- Cargo: ${shipment.cargo} (${formatCurrency(shipment.cargoValue)})
- Carrier: ${shipment.carrierName}
- Risk score: ${shipment.riskScore}%
- Theft probability: ${shipment.theftProbability}%
- ETA: ${shipment.eta}
- Route deviation: ${shipment.routeDeviation ? "YES" : "no"}
- Unauthorized stop: ${shipment.unauthorizedStop ? "YES" : "no"}
- Cold chain: ${shipment.coldChain ? "yes" : "no"}
- Risk factors: ${shipment.riskReasons.join("; ")}
- Recommended action: ${shipment.recommendedAction}`;
}

export function getRiskGptMockResponse(shipment: Shipment, message: string): string {
  const q = message.toLowerCase();

  if (q.includes("waive") || q.includes("tts")) {
    return `**TTS / Event Waiver Assessment — ${shipment.id}**

Before waiving, confirm:
• Driver identity via secondary channel
• Mechanical issue documented with photos/GPS
• Carrier dispatch acknowledgment

**Risk if waived without verification:** ${shipment.theftProbability}% theft exposure remains elevated on ${shipment.origin} → ${shipment.destination} corridor.

**Recommendation:** Do not waive until carrier provides maintenance log. If mechanical confirmed, waive with 2-hour re-check interval.`;
  }

  if (q.includes("escort") || q.includes("security")) {
    return `**Security Escort Analysis — ${shipment.id}**

Current risk score **${shipment.riskScore}%** with ${shipment.theftProbability}% theft probability.

${shipment.riskReasons.map((r) => `• ${r}`).join("\n")}

**Recommendation:** ${shipment.recommendedAction}

Estimated risk reduction with armed escort: **-${Math.min(45, Math.round(shipment.riskScore * 0.4))}%**`;
  }

  if (q.includes("route") || q.includes("divert") || q.includes("reroute")) {
    return `**Route Risk Summary — ${shipment.id}**

Active lane: ${shipment.origin} → ${shipment.destination}
${shipment.routeDeviation ? "⚠ Route deviation detected — investigate immediately." : "Route on plan."}
${shipment.unauthorizedStop ? "⚠ Unauthorized stop flagged." : ""}

**Recommendation:** ${shipment.recommendedAction}`;
  }

  return `**RiskGPT Analysis — ${shipment.id}**

• **Risk score:** ${shipment.riskScore}% | **Theft probability:** ${shipment.theftProbability}%
• **Cargo:** ${shipment.cargo} (${formatCurrency(shipment.cargoValue)}) via ${shipment.carrierName}
• **Route:** ${shipment.origin} → ${shipment.destination}

**Key risk factors:**
${shipment.riskReasons.map((r) => `• ${r}`).join("\n")}

**Recommended action:** ${shipment.recommendedAction}

Ask me about escorts, route diversion, TTS waivers, or carrier verification.`;
}
