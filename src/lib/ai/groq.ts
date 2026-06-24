export const GROQ_MODEL = "llama-3.3-70b-versatile";

export function hasGroqKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatGroq(messages: GroqMessage[]): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 900,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
