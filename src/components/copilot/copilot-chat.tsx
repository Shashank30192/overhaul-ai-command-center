"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, MessageSquare } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Which shipment has highest theft risk?",
  "Show delayed shipments.",
  "What fraud cases occurred this week?",
  "Which routes should be avoided?",
  "Generate executive summary.",
];

const EXAMPLE_CONVERSATIONS = [
  { title: "Theft Risk Analysis", query: "Which shipment has highest theft risk?" },
  { title: "Fraud Investigation", query: "What fraud cases occurred this week?" },
  { title: "Route Safety", query: "Which routes should be avoided?" },
  { title: "Executive Brief", query: "Generate executive summary." },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-blue-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-semibold text-white mb-1">{line.replace(/\*\*/g, "")}</p>;
        }
        if (line.startsWith("• ") || line.startsWith("- ")) {
          return <p key={i} className="text-zinc-300 text-sm ml-2">{line}</p>;
        }
        if (line.startsWith("🔴") || line.startsWith("🟠") || line.startsWith("🛡️")) {
          return <p key={i} className="text-zinc-300 text-sm">{line}</p>;
        }
        if (line.startsWith("|")) return null;
        if (line.match(/^\d+\./)) {
          return <p key={i} className="text-zinc-300 text-sm">{line}</p>;
        }
        return line ? <p key={i} className="text-zinc-300 text-sm mb-1">{line.replace(/\*\*/g, "")}</p> : <br key={i} />;
      })}
    </div>
  );
}

interface CopilotChatProps {
  onSend: (message: string, onToken: (delta: string) => void) => Promise<string>;
}

export function CopilotChat({ onSend }: CopilotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to Overhaul AI Copilot. I have real-time access to your supply chain network — 500 active shipments, fraud cases, and risk intelligence. How can I help?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const assistantId = (Date.now() + 1).toString();
    let started = false;

    const appendToken = (delta: string) => {
      if (!started) {
        started = true;
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: delta, timestamp: new Date().toISOString() },
        ]);
        return;
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m))
      );
    };

    const full = await onSend(text.trim(), appendToken);

    // If nothing streamed (e.g. mock JSON mode), render the full response once.
    if (!started) {
      await new Promise((r) => setTimeout(r, 600));
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: full, timestamp: new Date().toISOString() },
      ]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
      <div className="lg:w-64 shrink-0 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--mil-muted)] flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Example Conversations
        </h3>
        {EXAMPLE_CONVERSATIONS.map((ex) => (
          <button
            key={ex.title}
            onClick={() => sendMessage(ex.query)}
            className="w-full text-left p-3 rounded-md border border-[var(--mil-border)] bg-[var(--mil-elevated)] hover:bg-[var(--mil-panel)] hover:border-blue-500/30 transition-colors"
          >
            <p className="text-sm text-white font-medium">{ex.title}</p>
            <p className="text-xs text-[var(--mil-muted)] mt-1 truncate">{ex.query}</p>
          </button>
        ))}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--mil-border)] bg-[var(--mil-panel)]">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Supply Chain Copilot</p>
            <p className="text-xs text-blue-400">● Online — Real-time data access</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-blue-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-blue-500/20 border border-blue-500/30 text-white"
                      : "bg-[var(--mil-elevated)] border border-[var(--mil-border)]"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <MessageContent content={msg.content} />
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-lg bg-[var(--mil-elevated)] flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-[var(--mil-muted)]" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-400" />
              </div>
              <div className="bg-[var(--mil-elevated)] border border-[var(--mil-border)] rounded-xl">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-[var(--mil-border)]">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-blue-400 hover:border-blue-500/30 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about shipments, risks, fraud, routes..."
              className="flex-1 h-10 rounded-md border border-[var(--mil-border)] bg-[var(--mil-surface)] px-4 text-sm text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <Button type="submit" disabled={typing || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
