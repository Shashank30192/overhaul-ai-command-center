import { NextResponse } from "next/server";
import { demoData, generateIncidentReport, getShipmentById } from "@/lib/data";
import { hasApiKey, MODELS } from "@/lib/ai/anthropic";
import { runAgent } from "@/lib/ai/agent";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { shipmentId } = await request.json().catch(() => ({ shipmentId: undefined }));
  const shipment = (shipmentId && getShipmentById(shipmentId)) || demoData.shipments[0];

  // Deterministic base report (also the fallback when no API key).
  const base = generateIncidentReport(shipment);

  if (!hasApiKey()) {
    return NextResponse.json({ ...base, mode: "mock" });
  }

  try {
    const prompt = `An incident alert fired for shipment ${shipment.id}. Look it up with the tools, then write an incident investigation.
Return STRICT JSON only (no markdown, no code fences) with this exact shape:
{
  "rootCause": "1-2 sentence root cause",
  "gpsAnalysis": "1-2 sentences",
  "driverAnalysis": "1-2 sentences",
  "documentAnalysis": "1-2 sentences",
  "summary": "2-3 sentence executive summary",
  "recommendations": ["action 1","action 2","action 3","action 4"]
}`;
    const text = await runAgent(prompt, MODELS.reasoning, 1200);
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
  } catch {
    // fall through to base
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
