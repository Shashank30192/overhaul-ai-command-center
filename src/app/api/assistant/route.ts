import { NextResponse } from "next/server";
import { hasGroqKey, chatGroq } from "@/lib/ai/groq";
import { getAssistantResponse } from "@/lib/mock/agent-mock";
import { demoData } from "@/lib/data";

export const runtime = "nodejs";

type HistoryItem = { role: "user" | "assistant"; content: string };

const buildSystem = () => {
  const topShipments = demoData.shipments.slice(0, 5).map(s =>
    `${s.id}: ${s.cargo}, risk ${s.riskScore}%, ${s.origin}→${s.destination}, carrier: ${s.carrierName}`
  ).join("\n");
  const fraudSummary = demoData.fraudCases.slice(0, 3).map(f =>
    `${f.id}: ${f.type.replace(/_/g, " ")}, carrier ${f.carrierName}, status: ${f.status}`
  ).join("\n");

  return `You are an AI Supply Chain Intelligence Assistant for Overhaul's GSOC platform. You have access to live shipment data, fraud cases, and carrier intelligence.

LIVE PORTFOLIO DATA:
- Total shipments: ${demoData.shipments.length}
- Active fraud cases: ${demoData.fraudCases.length}
- Monitored carriers: ${demoData.carriers.length}
- Insurance savings YTD: $${(demoData.executiveStats.insuranceSavings / 1e6).toFixed(1)}M

TOP RISK SHIPMENTS:
${topShipments}

RECENT FRAUD CASES:
${fraudSummary}

You can answer questions about shipment status, risk analysis, carrier compliance, route recommendations, cold chain issues, and fraud patterns. Provide detailed, actionable intelligence. Use markdown formatting for clarity.`;
};

export async function POST(request: Request) {
  const body = await request.json() as { message?: string; history?: HistoryItem[] };
  const { message, history = [] } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  if (hasGroqKey()) {
    try {
      const response = await chatGroq([
        { role: "system", content: buildSystem() },
        ...history.slice(-10).map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
        { role: "user", content: message.trim() },
      ]);
      return NextResponse.json({ response, mode: "groq" });
    } catch (err) {
      console.error("Assistant Groq error:", err);
    }
  }

  return NextResponse.json({ response: getAssistantResponse(message), mode: "mock" });
}
