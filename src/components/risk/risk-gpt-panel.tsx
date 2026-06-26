"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, FileText, List, Loader2 } from "lucide-react";
import type { Shipment } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "notes" | "chat" | "instructions";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface RiskGptPanelProps {
  shipment: Shipment;
}

function renderMarkdownLite(text: string) {
  return text.split("\n").map((line, i) => {
    const cleaned = line.replace(/\*\*/g, "");
    if (!line.trim()) return <br key={i} />;
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <p key={i} className="text-white/80 ml-2">
          {cleaned}
        </p>
      );
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="font-semibold text-white mb-1">
          {cleaned}
        </p>
      );
    }
    return (
      <p key={i} className="text-white/80 mb-1">
        {cleaned}
      </p>
    );
  });
}

export function RiskGptPanel({ shipment }: RiskGptPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  const sendMessage = useCallback(
    async (text: string, { silent = false }: { silent?: boolean } = {}) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      if (!silent) {
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
      }
      setLoading(true);
      setActiveTab("chat");

      try {
        const history = messages.map((m) => ({ role: m.role, content: m.content }));
        const res = await fetch("/api/riskgpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            shipmentId: shipment.id,
            history,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Request failed");
        }

        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.response as string,
        };

        if (silent) {
          setMessages([assistantMsg]);
        } else {
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } catch {
        const fallback: ChatMessage = {
          id: `a-err-${Date.now()}`,
          role: "assistant",
          content: `Unable to reach RiskGPT right now. Based on ${shipment.id}: risk score ${shipment.riskScore}%, theft probability ${shipment.theftProbability}%. ${shipment.recommendedAction}`,
        };
        setMessages((prev) => (silent ? [fallback] : [...prev, fallback]));
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, shipment],
  );

  // Auto-analyze when shipment changes
  useEffect(() => {
    setMessages([]);
    setInput("");
    void sendMessage("Provide an initial risk analysis and recommended actions for this active alert.", {
      silent: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipment.id]);

  const handleSend = () => {
    void sendMessage(input);
  };

  const handleAddNote = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setNotes((prev) => [trimmed, ...prev]);
    setInput("");
    setActiveTab("notes");
  };

  return (
    <div className="absolute bottom-2 left-4 right-4 z-[1000] max-w-xl" style={{ bottom: "228px" }}>
      <div className="rounded-lg border border-[var(--mil-border)] bg-[var(--mil-panel)]/95 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex border-b border-[var(--mil-border)]">
          {([
            { id: "notes" as Tab, label: "Notes", icon: FileText },
            { id: "chat" as Tab, label: "Chat with RiskGPT", icon: MessageSquare },
            { id: "instructions" as Tab, label: "Instructions", icon: List },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
                activeTab === id
                  ? "text-white bg-[var(--mil-elevated)] border-b-2 border-blue-500"
                  : "text-[var(--mil-muted)] hover:text-white",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 max-h-52 overflow-y-auto text-xs text-[var(--mil-text)] space-y-3">
          {activeTab === "chat" && (
            <>
              {messages.length === 0 && loading && (
                <div className="flex items-center gap-2 text-[var(--mil-muted)]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  RiskGPT analyzing {shipment.id}…
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-md px-3 py-2",
                    msg.role === "user"
                      ? "bg-blue-500/15 border border-blue-500/20 ml-4"
                      : "bg-[var(--mil-elevated)] border border-[var(--mil-border)] mr-4",
                  )}
                >
                  {msg.role === "user" ? (
                    <p className="text-white/90">{msg.content}</p>
                  ) : (
                    <div>{renderMarkdownLite(msg.content)}</div>
                  )}
                </div>
              ))}
              {loading && messages.length > 0 && (
                <div className="flex items-center gap-2 text-[var(--mil-muted)]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  RiskGPT thinking…
                </div>
              )}
            </>
          )}

          {activeTab === "notes" && (
            <div className="space-y-2">
              {notes.length === 0 ? (
                <p className="text-[var(--mil-muted)]">No notes yet. Add a status update below.</p>
              ) : (
                notes.map((note, i) => (
                  <p key={i} className="text-white/80 border-l-2 border-blue-500/40 pl-2">
                    {note}
                  </p>
                ))
              )}
            </div>
          )}

          {activeTab === "instructions" && (
            <ol className="space-y-1 list-decimal list-inside text-white/80">
              <li>Contact carrier dispatch immediately</li>
              <li>Verify driver identity via secondary channel</li>
              <li>Consider TTS waiver if mechanical issue confirmed</li>
              <li>Escalate to security if risk score exceeds 80%</li>
            </ol>
          )}
        </div>

        <div className="p-3 border-t border-[var(--mil-border)] flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (activeTab === "notes") handleAddNote();
                else handleSend();
              }
            }}
            placeholder={activeTab === "notes" ? "Add a note…" : "Ask RiskGPT about this alert…"}
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs rounded-md bg-[var(--mil-surface)] border border-[var(--mil-border)] text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={activeTab === "notes" ? handleAddNote : handleSend}
            disabled={loading || !input.trim()}
            className="px-3 py-2 text-xs font-medium rounded-md bg-[var(--mil-blue)] text-white hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
