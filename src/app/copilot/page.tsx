"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { CopilotChat } from "@/components/copilot/copilot-chat";

export default function CopilotPage() {
  const handleSend = async (message: string, onToken: (delta: string) => void) => {
    const res = await fetch("/api/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const contentType = res.headers.get("Content-Type") || "";

    // Mock mode returns JSON; Claude mode streams text/plain.
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return data.response as string;
    }

    if (!res.body) return "";
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onToken(chunk);
    }
    return full;
  };

  return (
    <PageWrapper
      title="AI Supply Chain Copilot"
      subtitle="Ask questions about shipments, risks, fraud, and routes in natural language."
    >
      <CopilotChat onSend={handleSend} />
    </PageWrapper>
  );
}
