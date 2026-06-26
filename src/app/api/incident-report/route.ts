import { NextResponse } from "next/server";
import { demoData, generateIncidentReport, getShipmentById } from "@/lib/data";
import { hasApiKey, MODELS } from "@/lib/ai/anthropic";
import { runAgent } from "@/lib/ai/agent";
import { hasGroqKey, chatGroq } from "@/lib/ai/groq";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { shipmentId } = await request.json().catch(() => ({ shipmentId: undefined }));
  const shipment = (shipmentId && getShipmentById(shipmentId)) || demoData.shipments[0];

  // Deterministic base report (also the fallback when no API key).
  const base = generateIncidentReport(shipment);

  const incidentPrompt = `Shipment ${shipment.id}: cargo "${shipment.cargo}", carrier ${shipment.carrierName}, risk score ${shipment.riskScore}%, route ${shipment.origin}→${shipment.destination}, risk reasons: ${shipment.riskReasons.join(", ")}.
Write an incident investigation. Return STRICT JSON only (no markdown, no code fences):
{"rootCause":"1-2 sentence root cause","gpsAnalysis":"1-2 sentences","driverAnalysis":"1-2 sentences","documentAnalysis":"1-2 sentences","summary":"2-3 sentence executive summary","recommendations":["action 1","action 2","action 3","action 4"]}`;

  if (hasGroqKey()) {
    try {
      const text = await chatGroq([
        { role: "system", content: "You are a supply chain security investigator. Return only valid JSON, no markdown." },
        { role: "user", content: incidentPrompt },
      ]);
      const json = extractJson(text);
      if (json) {
        return NextResponse.json({
          ...base,
          rootCause: json.rootCause ?? base.rootCause,
          gpsAnalysis: json.gpsAnalysis ?? base.gpsAnalysis,
          driverAnalysis: json.driverAnalysis ?? base.driverAnalysis,
          documentAnalysis: json.documentAnalysis ?? base.documentAnalysis,
          summary: json.summary ?? base.summary,
          recommendations: Array.isArray(json.recommendations) ? json.recommendations : base.recommendations,
          mode: "groq",
        });
      }
    } catch { /* fall through */ }
  }

  if (hasApiKey()) {
    try {
      const text = await runAgent(incidentPrompt, MODELS.reasoning, 1200);
      const json = extractJson(text);
      if (json) {
        return NextResponse.json({
          ...base,
          rootCause: json.rootCause ?? base.rootCause,
          gpsAnalysis: json.gpsAnalysis ?? base.gpsAnalysis,
          driverAnalysis: json.driverAnalysis ?? base.driverAnalysis,
          documentAnalysis: json.documentAnalysis ?? base.documentAnalysis,
          summary: json.summary ?? base.summary,
          recommendations: Array.isArray(json.recommendations) ? json.recommendations : base.recommendations,
          mode: "claude",
        });
      }
    } catch { /* fall through */ }
  }

  return NextResponse.json({ ...base, mode: "mock" });
}

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}
