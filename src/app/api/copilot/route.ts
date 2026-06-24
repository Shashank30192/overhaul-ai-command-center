import { NextResponse } from "next/server";
import { getCopilotResponse } from "@/lib/mock/copilot-responses";
import { hasApiKey, SYSTEM_PROMPT } from "@/lib/ai/anthropic";
import { streamAgentResponse } from "@/lib/ai/agent";
import { hasGroqKey, chatGroq } from "@/lib/ai/groq";
import { demoData } from "@/lib/data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { message } = await request.json();
  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  // Groq LLM (preferred when GROQ_API_KEY is set)
  if (hasGroqKey()) {
    try {
      const context = `You have access to a supply chain dataset with ${demoData.shipments.length} shipments, ${demoData.fraudCases.length} fraud cases, and ${demoData.carriers.length} carriers. Top risk shipment: ${demoData.shipments[0]?.id} (risk ${demoData.shipments[0]?.riskScore}%).`;
      const response = await chatGroq([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: context },
        { role: "user", content: message },
      ]);
      return NextResponse.json({
        response,
        mode: "groq",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Copilot Groq error:", err);
    }
  }

  // No LLM key configured -> fall back to deterministic mock.
  if (!hasApiKey()) {
    const response = getCopilotResponse(message);
    return NextResponse.json({
      response,
      mode: "mock",
      timestamp: new Date().toISOString(),
    });
  }

  // Real Claude (Haiku) with tool-calling, streamed as plain text chunks.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamAgentResponse(message)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const fallback = getCopilotResponse(message);
        controller.enqueue(
          encoder.encode(
            (err instanceof Error ? "" : "") + fallback,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Copilot-Mode": "claude",
      "Cache-Control": "no-cache",
    },
  });
}
