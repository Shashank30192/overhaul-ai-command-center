import { NextResponse } from "next/server";
import { demoData } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    hotspots: demoData.riskHotspots,
    coldChain: demoData.coldChainIncidents,
    trends: demoData.monthlyTrends,
  });
}
