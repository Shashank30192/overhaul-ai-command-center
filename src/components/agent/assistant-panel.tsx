"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, RotateCcw, Database, TrendingUp, FileText, AlertTriangle, Users, Thermometer, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASSISTANT_SUGGESTIONS } from "@/lib/mock/agent-mock";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTION_ICONS = [TrendingUp, AlertTriangle, TrendingUp, FileText, Users, Thermometer];

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (!line.trim()) return <br key={i} />;

    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="text-sm font-bold text-white mt-3 mb-1">
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="text-xs font-semibold text-white/90 mt-2 mb-1 uppercase tracking-wide">
          {line.slice(4)}
        </h3>
      );
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const content = line.slice(2);
      return (
        <div key={i} className="flex items-start gap-2 ml-2 mb-0.5">
          <span className="text-blue-400 mt-1 shrink-0">•</span>
          <span className="text-white/80 text-sm">{renderInline(content)}</span>
        </div>
      );
    }
    if (line.startsWith("*") && line.endsWith("*")) {
      return <p key={i} className="text-[11px] text-[var(--mil-muted)] italic mb-1">{line.slice(1, -1)}</p>;
    }
    // Table row
    if (line.startsWith("|") && line.includes("|")) {
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) return null; // divider row
      return (
        <div key={i} className="grid gap-1 mb-0.5" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
          {cells.map((cell, j) => (
            <span key={j} className={cn("text-xs px-1", j === 0 ? "text-white/90 font-medium" : "text-white/60")}>
              {cell}
            </span>
          ))}
        </div>
      );
    }
    // Numbered list
    const numMatch = line.match(/^(\d+)\. (.+)/);
    if (numMatch) {
      return (
        <div key={i} className="flex items-start gap-2 ml-2 mb-0.5">
          <span className="text-blue-400 font-semibold shrink-0 text-xs">{numMatch[1]}.</span>
          <span className="text-white/80 text-sm">{renderInline(numMatch[2])}</span>
        </div>
      );
    }

    return (
      <p key={i} className="text-sm text-white/80 mb-1 leading-relaxed">
        {renderInline(line)}
      </p>
    );
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, j) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={j} className="text-white font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={j}>{part}</span>
    )
  );
}

export function AssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "## RiskGPT Assistant\n\nI'm connected to your **live Overhaul platform data** and can analyze your current dashboard context to generate insights, summaries, and recommendations.\n\nUnlike a basic chatbot, I understand your active alerts, shipment portfolio, carrier profiles, and risk trends.\n\nWhat would you like me to analyze?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiMode, setAiMode] = useState<string>("groq");
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    setInput("");

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: historyRef.current }),
      });
      const data = await res.json() as { response: string; mode: string };
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: data.response }]);
      setAiMode(data.mode);
      historyRef.current = [...historyRef.current, { role: "user" as const, content: trimmed }, { role: "assistant" as const, content: data.response }].slice(-16);
    } catch {
      setMessages((prev) => [...prev, { id: `a-err-${Date.now()}`, role: "assistant", content: "Failed to reach AI. Please try again." }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const reset = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content:
        "## RiskGPT Assistant\n\nI'm connected to your **live Overhaul platform data** and can analyze your current dashboard context to generate insights, summaries, and recommendations.\n\nUnlike a basic chatbot, I understand your active alerts, shipment portfolio, carrier profiles, and risk trends.\n\nWhat would you like me to analyze?",
    }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Capability banner */}
      <div className="shrink-0 mx-6 mt-4 p-3 rounded-lg bg-[#00c2b2]/8 border border-[#00c2b2]/20 flex items-start gap-3">
        <Database className="h-4 w-4 text-[#00c2b2] mt-0.5 shrink-0" />
        <div className="text-xs text-slate-300 flex-1">
          <span className="font-semibold text-[#00c2b2]">Mode 2 — Intelligence Assistant (Groq AI):</span>{" "}
          Connected to live shipment data, fraud cases, and carrier intelligence. Powered by Llama 3.3-70B.
        </div>
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0",
          aiMode === "groq" ? "bg-[#00c2b2]/15 text-[#00c2b2]" : "bg-slate-500/20 text-slate-400"
        )}>{aiMode}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-2xl rounded-xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-[var(--mil-blue)] text-white"
                    : "bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-text)]"
                )}
              >
                {renderMarkdown(msg.content)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="h-7 w-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            </div>
            <div className="bg-[var(--mil-surface)] border border-[var(--mil-border)] rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-[11px] text-[var(--mil-muted)] mr-1">Analyzing platform data</span>
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 bg-blue-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="shrink-0 px-6 pb-3">
          <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-2">Suggested insights:</p>
          <div className="grid grid-cols-2 gap-2">
            {ASSISTANT_SUGGESTIONS.map((s, i) => {
              const Icon = SUGGESTION_ICONS[i] ?? TrendingUp;
              return (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white hover:border-blue-500/30 transition-colors text-left"
                >
                  <Icon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-6 pb-6 pt-3 border-t border-[var(--mil-border)]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            placeholder="Ask about your live data — risks, trends, carriers, alerts…"
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:border-[#00c2b2]/40 disabled:opacity-50"
          />
          <button
            onClick={() => void send(input)}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-lg bg-[#00c2b2] text-white text-sm font-medium hover:bg-[#00a89a] transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
          <button
            onClick={reset}
            className="px-3 py-2.5 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--mil-muted)] mt-2">
          Powered by Groq · Llama 3.3-70B · Live shipment + fraud + carrier data
        </p>
      </div>
    </div>
  );
}
