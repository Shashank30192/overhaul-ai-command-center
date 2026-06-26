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
    phase: "start" | "complete" | "decision";
    workflowTitle?: string;
    workflowResult?: Record<string, string>;
    history?: HistoryItem[];
  };

  const { message, phase, workflowTitle, workflowResult, history = [] } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  // Decision phase: agent evaluates severity and picks an action
  if (phase === "decision") {
    const decisionPrompt = `You are an autonomous GSOC agent. A cargo alert has been detected with the following data:
${message}

Based on this severity data, decide the SINGLE best action to take right now. Choose ONE:
1. Call the driver directly
2. Contact carrier dispatch
3. Waive the event (low risk)
4. Escalate to police immediately

Respond in this exact JSON format (no markdown):
{"action": "call-driver" | "contact-carrier" | "waive" | "escalate-police", "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW", "reasoning": "one sentence why", "confidence": 85}`;

    if (hasGroqKey()) {
      try {
        const raw = await chatGroq([
          { role: "system", content: "You are a risk assessment AI. Respond only with valid JSON." },
          { role: "user", content: decisionPrompt },
        ]);
        const match = raw.match(/\{[\s\S]*\}/);
        const decision = match ? JSON.parse(match[0]) as { action: string; severity: string; reasoning: string; confidence: number } : null;
        if (decision) return NextResponse.json({ decision, mode: "groq" });
      } catch { /* fall through */ }
    }
    // Fallback decision based on keyword matching
    const isHigh = /98|97|critical|99|compound/i.test(message);
    return NextResponse.json({
      decision: {
        action: isHigh ? "call-driver" : "waive",
        severity: isHigh ? "CRITICAL" : "MEDIUM",
        reasoning: isHigh ? "Risk score 98%+ with unauthorized stop requires immediate driver contact." : "Risk level within acceptable parameters.",
        confidence: 90,
      },
      mode: "mock",
    });
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
