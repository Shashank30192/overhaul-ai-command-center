import { NextResponse } from "next/server";
import { demoData, getTopRiskShipments } from "@/lib/data";
import type { ExecutiveBriefing } from "@/lib/types";
import { hasApiKey, MODELS } from "@/lib/ai/anthropic";
import { runAgent } from "@/lib/ai/agent";
import { hasGroqKey, chatGroq } from "@/lib/ai/groq";

export const runtime = "nodejs";

const STATIC_RECOMMENDATIONS = [
  "Deploy security escorts on 4 critical shipments exceeding 85% theft risk",
  "Suspend 2 carriers pending fraud investigation (MC verification failed)",
  "Reroute 12 shipments away from I-95 high-theft corridor",
  "Activate enhanced cold chain monitoring on 8 pharmaceutical loads",
  "Initiate insurance pre-claim documentation for TX-45872 ($1.2M exposure)",
];

export async function GET() {
  const topRisks = getTopRiskShipments(3);

  let recommendations = STATIC_RECOMMENDATIONS;
  let mode = "mock";

  const topRiskSummary = topRisks.map(s => `${s.id}: ${s.cargo}, risk ${s.riskScore}%, ${s.origin}→${s.destination}`).join("; ");
  const execPrompt = `You are an executive risk advisor for Overhaul, a cargo security platform. Active portfolio: ${demoData.shipments.length} shipments, ${demoData.fraudCases.length} fraud cases, ${demoData.carriers.length} carriers. Top risks: ${topRiskSummary}. Produce exactly 5 concise, executive-ready action recommendations for today. Return ONLY a plain numbered list (1-5), no preamble, no markdown headers.`;

  if (hasGroqKey()) {
    try {
      const text = await chatGroq([
        { role: "system", content: "You are a concise executive risk advisor. Return only a numbered list." },
        { role: "user", content: execPrompt },
      ]);
      const parsed = text
        .split("\n")
        .map((l) => l.replace(/^\s*\d+[.)]\s*/, "").replace(/^[-*]\s*/, "").trim())
        .filter((l) => l.length > 8);
      if (parsed.length >= 3) { recommendations = parsed.slice(0, 5); mode = "groq"; }
    } catch { /* fall through */ }
  }

  if (mode === "mock" && hasApiKey()) {
    try {
      const text = await runAgent(execPrompt, MODELS.reasoning, 700);
      const parsed = text
        .split("\n")
        .map((l) => l.replace(/^\s*\d+[.)]\s*/, "").replace(/^[-*]\s*/, "").trim())
        .filter((l) => l.length > 8);
      if (parsed.length >= 3) { recommendations = parsed.slice(0, 5); mode = "claude"; }
    } catch { /* fall through */ }
  }

  const briefing: ExecutiveBriefing & { mode: string } = {
    mode,
    generatedAt: new Date().toISOString(),
    topRisks: topRisks.map((s) => ({
      title: `${s.id} — ${s.cargo} (${s.riskScore}% risk)`,
      severity: s.riskScore > 85 ? "critical" : "high",
      impact: `${s.origin} → ${s.destination} | ${s.carrierName}`,
    })),
    majorIncidents: demoData.fraudCases.slice(0, 3).map((f) => ({
      id: f.id,
      description: `${f.type.replace(/_/g, " ")} on shipment ${f.shipmentId} — ${f.carrierName}`,
      status: f.status,
    })),
    recommendations,
    financialImpact: [
      { category: "Insurance Savings YTD", amount: demoData.executiveStats.insuranceSavings },
      { category: "Fraud Prevented", amount: 2_400_000 },
      { category: "Theft Loss Avoided", amount: 8_700_000 },
      { category: "Operational Efficiency", amount: 1_200_000 },
    ],
  };
  return NextResponse.json(briefing);
}
