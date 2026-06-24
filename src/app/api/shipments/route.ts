import { NextResponse } from "next/server";
import { demoData } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const status = searchParams.get("status");
  const minRisk = parseInt(searchParams.get("minRisk") || "0");

  let shipments = demoData.shipments;
  if (status) shipments = shipments.filter((s) => s.status === status);
  if (minRisk) shipments = shipments.filter((s) => s.riskScore >= minRisk);

  return NextResponse.json({
    total: demoData.shipments.length,
    count: Math.min(limit, shipments.length),
    data: shipments.slice(0, limit),
  });
}
