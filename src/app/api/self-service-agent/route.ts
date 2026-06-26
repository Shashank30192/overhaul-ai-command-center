import { NextResponse } from "next/server";
import { chatGroq, hasGroqKey, type GroqMessage } from "@/lib/ai/groq";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the Overhaul AI Self-Service Agent — an intelligent logistics and supply chain assistant embedded in the Overhaul platform. Overhaul is a cargo risk management and visibility company.

Your role: help logistics operations teams track shipments, assess cargo risk, investigate alerts, verify carriers, file incidents, and navigate the Overhaul platform.

Persona:
- Professional, concise, and action-oriented
- You are an autonomous agent that actively navigates the platform on behalf of the user
- You speak in first person as the agent taking action ("I'm checking…", "I found…", "I've opened…")
- You interpret user goals and execute them, not just answer questions

Key capabilities you can demonstrate:
- Track shipment location and ETA
- Assess risk scores and interpret RiskGPT analysis
- Investigate compound alerts (Light & Stop, route deviations, unauthorized stops)
- Verify carrier credentials via FMCSA/USDOT lookups
- File incident reports with evidence
- Call drivers and log outcomes
- Generate executive risk briefings

Formatting: keep responses under 3 sentences. Be direct. When starting a workflow, briefly confirm what you're about to do. When completing one, summarize the outcome in 1-2 sentences with key numbers.`;

type HistoryItem = { role: "user" | "agent" | "system"; content: string };

export async function POST(request: Request) {
  const body = await request.json() as {
    message: string;
    phase: "start" | "complete";
    workflowTitle?: string;
    workflowResult?: Record<string, string>;
    history?: HistoryItem[];
  };

  const { message, phase, workflowTitle, workflowResult, history = [] } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  if (!hasGroqKey()) {
    return NextResponse.json({ response: getFallback(phase, workflowTitle, workflowResult), mode: "mock" });
  }

  // Build conversation history (last 6 turns, exclude system messages)
  const historyMessages: GroqMessage[] = history
    .filter(h => h.role !== "system")
    .slice(-6)
    .map(h => ({
      role: h.role === "agent" ? "assistant" : "user" as "user" | "assistant",
      content: h.content,
    }));

  // Build the user turn based on phase
  let userPrompt: string;
  if (phase === "start") {
    userPrompt = `User request: "${message}"\nWorkflow being executed: ${workflowTitle ?? "unknown"}\nRespond in 1-2 sentences confirming you're starting this task and what you'll do.`;
  } else {
    const resultLines = workflowResult
      ? Object.entries(workflowResult).map(([k, v]) => `${k}: ${v}`).join(", ")
      : "";
    userPrompt = `Workflow "${workflowTitle}" is now complete.\nResults: ${resultLines}\nWrite a 2-3 sentence summary of what was accomplished and the key findings. Be specific with the numbers.`;
  }

  try {
    const messages: GroqMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...historyMessages,
      { role: "user", content: userPrompt },
    ];

    const response = await chatGroq(messages);
    return NextResponse.json({ response, mode: "groq" });
  } catch (err) {
    console.error("Self-service agent Groq error:", err);
    return NextResponse.json({ response: getFallback(phase, workflowTitle, workflowResult), mode: "mock" });
  }
}

function getFallback(
  phase: string,
  workflowTitle?: string,
  result?: Record<string, string>
): string {
  if (phase === "start") {
    return `I'll **${workflowTitle ?? "complete your request"}** now. Let me navigate the platform…`;
  }
  if (result?.["Resolution"]) {
    return `**${workflowTitle}** complete. ${result["Resolution"]}`;
  }
  return `**${workflowTitle ?? "Task"}** has been completed successfully.`;
}
