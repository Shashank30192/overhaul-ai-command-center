import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS, SYSTEM_PROMPT } from "./anthropic";
import { TOOLS, runTool } from "./tools";

const MAX_TOOL_ROUNDS = 4;

/**
 * Run an agentic tool-calling loop and STREAM the final text answer.
 * Yields text deltas as they arrive. Used by the copilot chat (Haiku).
 */
export async function* streamAgentResponse(
  userMessage: string,
  model: string = MODELS.fast,
): AsyncGenerator<string> {
  const anthropic = getAnthropic();
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const stream = anthropic.messages.stream({
      model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    // Stream text deltas live to the client as they arrive.
    stream.on("text", () => {}); // ensure events flow
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }

    const final = await stream.finalMessage();

    if (final.stop_reason !== "tool_use") return;

    // Execute requested tools, append results, loop again.
    messages.push({ role: "assistant", content: final.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of final.content) {
      if (block.type === "tool_use") {
        const result = runTool(block.name, block.input as Record<string, unknown>);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }
}

/**
 * Run an agentic tool-calling loop and return the full text (non-streaming).
 * Used for structured reasoning tasks (Sonnet).
 */
export async function runAgent(
  userMessage: string,
  model: string = MODELS.reasoning,
  maxTokens = 2000,
): Promise<string> {
  const anthropic = getAnthropic();
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason !== "tool_use") {
      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
    }

    messages.push({ role: "assistant", content: response.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const result = runTool(block.name, block.input as Record<string, unknown>);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }

  return "Unable to complete the analysis within the allowed tool rounds.";
}
