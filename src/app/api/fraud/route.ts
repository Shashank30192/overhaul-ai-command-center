import { NextResponse } from "next/server";
import { demoData } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ total: demoData.fraudCases.length, data: demoData.fraudCases });
}
