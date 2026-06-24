import { NextResponse } from "next/server";
import type { RouteOption } from "@/lib/types";
import { hasApiKey, MODELS } from "@/lib/ai/anthropic";
import { runAgent } from "@/lib/ai/agent";

export const runtime = "nodejs";

const STATIC_ROUTES: RouteOption[] = [
  { id: "r1", name: "I-81 → I-64 Corridor", type: "safer", distance: 1247, duration: "18h 30m", cost: 4200, riskScore: 32, savings: "42% risk reduction vs I-95" },
  { id: "r2", name: "Rail Intermodal via Chicago", type: "cheaper", distance: 1380, duration: "28h 15m", cost: 3100, riskScore: 28, savings: "$1,100 savings vs truck" },
  { id: "r3", name: "I-10 Western Express", type: "faster", distance: 1180, duration: "16h 45m", cost: 4800, riskScore: 45, savings: "3.5 hours faster" },
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const origin = body.origin || "Los Angeles, USA";
  const destination = body.destination || "Chicago, USA";

  if (!hasApiKey()) {
    return NextResponse.json({ mode: "mock", routes: STATIC_ROUTES });
  }

  try {
    const prompt = `Recommend three route options for a high-value cargo shipment from ${origin} to ${destination}: one SAFER, one CHEAPER, one FASTER.
Return STRICT JSON only (no markdown) as an array of exactly 3 objects with this shape:
[{"id":"r1","name":"route name","type":"safer","distance":1200,"duration":"18h 30m","cost":4200,"riskScore":32,"savings":"short benefit note"}]
type must be one of: "safer","cheaper","faster". distance in miles (number), cost in USD (number), riskScore 0-100 (number).`;
    const text = await runAgent(prompt, MODELS.reasoning, 900);
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const routes = JSON.parse(match[0]) as RouteOption[];
      if (Array.isArray(routes) && routes.length) {
        return NextResponse.json({ mode: "claude", routes: routes.slice(0, 3) });
      }
    }
  } catch {
    // fall through
  }

  return NextResponse.json({ mode: "mock", routes: STATIC_ROUTES });
}
