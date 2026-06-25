"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Send, RotateCcw, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavigatorResponse, NAVIGATOR_SUGGESTIONS, CUSTOMER, CUSTOMER_STATS } from "@/lib/mock/self-service-mock";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function renderMd(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-bold text-white mt-3 mb-1">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-xs font-semibold text-white/90 mt-2 mb-1 uppercase tracking-wide">{line.slice(4)}</h3>;
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const content = line.slice(2);
      return (
        <div key={i} className="flex items-start gap-2 ml-2 mb-0.5">
          <span className="text-blue-400 mt-1 shrink-0 text-xs">•</span>
          <span className="text-white/80 text-sm leading-relaxed">{renderInline(content)}</span>
        </div>
      );
    }
    if (line.startsWith("*") && line.endsWith("*") && !line.slice(1, -1).includes("*")) {
      return <p key={i} className="text-[11px] text-[var(--mil-muted)] italic mb-1">{line.slice(1, -1)}</p>;
    }
    if (line.startsWith("|") && line.includes("|")) {
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) return null;
      return (
        <div key={i} className="grid gap-1 mb-0.5" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
          {cells.map((cell, j) => (
            <span key={j} className={cn("text-xs px-1", j === 0 ? "text-white/90 font-medium" : "text-white/60")}>{cell}</span>
          ))}
        </div>
      );
    }
    const numMatch = line.match(/^(\d+)\. (.+)/);
    if (numMatch) {
      return (
        <div key={i} className="flex items-start gap-2 ml-2 mb-0.5">
          <span className="text-blue-400 font-semibold shrink-0 text-xs">{numMatch[1]}.</span>
          <span className="text-white/80 text-sm leading-relaxed">{renderInline(numMatch[2])}</span>
        </div>
      );
    }
    return <p key={i} className="text-sm text-white/80 mb-1 leading-relaxed">{renderInline(line)}</p>;
  });
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>
      : <span key={j}>{p}</span>
  );
}

export function SSNavigatorPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `## Navigator — ${CUSTOMER.name}\n\nI have access to your account data and can explain what's happening across your **${CUSTOMER_STATS.activeShipments} active shipments**, including the open tamper alert on SHP-83921.\n\nI can explain events, guide you through next steps, and provide context — but I don't take actions on your behalf. For autonomous resolution, switch to **Resolution Agent** (Mode 3).`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: trimmed }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: getNavigatorResponse(trimmed) }]);
      setIsTyping(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 800 + Math.random() * 600);
  };

  const reset = () => {
    setMessages([{ id: "welcome", role: "assistant", content: `## Navigator — ${CUSTOMER.name}\n\nI have access to your account data and can explain what's happening across your **${CUSTOMER_STATS.activeShipments} active shipments**, including the open tamper alert on SHP-83921.\n\nI can explain events, guide you through next steps, and provide context — but I don't take actions on your behalf. For autonomous resolution, switch to **Resolution Agent** (Mode 3).` }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Account context banner */}
      <div className="shrink-0 mx-6 mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
        <Package className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-200">
          <span className="font-semibold">Mode 2 — Navigator:</span>{" "}
          Connected to <span className="font-semibold">{CUSTOMER.name}</span> account data. Explains your alerts, guides resolution steps, and provides context from your shipments. Does not take actions.
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="h-3.5 w-3.5 text-blue-300" />
                </div>
              )}
              <div className={cn(
                "max-w-2xl rounded-xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-[var(--mil-blue)] text-white"
                  : "bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-text)]"
              )}>
                {renderMd(msg.content)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="h-7 w-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Compass className="h-3.5 w-3.5 text-blue-300" />
            </div>
            <div className="bg-[var(--mil-surface)] border border-[var(--mil-border)] rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-[11px] text-[var(--mil-muted)]">Checking your account data</span>
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.span key={i} className="h-1.5 w-1.5 bg-blue-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: d, repeat: Infinity }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="shrink-0 px-6 pb-3">
          <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-2">Ask about your account:</p>
          <div className="grid grid-cols-2 gap-2">
            {NAVIGATOR_SUGGESTIONS.map((s) => (
              <button key={s.text} onClick={() => send(s.text)}
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white hover:border-blue-500/30 transition-colors text-left">
                <span className="text-base shrink-0">{s.icon}</span>
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-6 pb-6 pt-3 border-t border-[var(--mil-border)]">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask about your shipments, alerts, carriers, or ETA…"
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:border-blue-500/50 disabled:opacity-50" />
          <button onClick={() => send(input)} disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
          <button onClick={reset}
            className="px-3 py-2.5 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white transition-colors">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--mil-muted)] mt-2">
          Navigator explains and guides — switch to Resolution Agent to act autonomously.
        </p>
      </div>
    </div>
  );
}
