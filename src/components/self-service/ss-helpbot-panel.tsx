"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Send, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHelpBotResponse, HELPBOT_SUGGESTIONS } from "@/lib/mock/self-service-mock";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Cargo Security": "text-amber-400 border-amber-500/30 bg-amber-500/10",
  "Fraud": "text-purple-400 border-purple-500/30 bg-purple-500/10",
  "Visibility": "text-blue-400 border-blue-500/30 bg-blue-500/10",
};

function renderMd(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    if (line.startsWith("• ") || line.startsWith("- ")) {
      const content = line.slice(2);
      const parts = content.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={i} className="flex items-start gap-2 ml-2 mb-0.5">
          <span className="text-slate-400 mt-1 shrink-0 text-xs">•</span>
          <span className="text-white/80 text-sm leading-relaxed">
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>
                : <span key={j}>{p}</span>
            )}
          </span>
        </div>
      );
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-1 leading-relaxed text-sm">
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>
            : <span key={j}>{p}</span>
        )}
      </p>
    );
  });
}

export function SSHelpBotPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Hi, I'm **Help Bot** — I can answer general questions about Overhaul alerts, cargo security, carrier verification, and shipment tracking.\n\nI don't have access to your live shipment data and can't take any actions. For account-specific help, switch to **Navigator** or **Resolution Agent**.",
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
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, role: "bot", content: getHelpBotResponse(trimmed) }]);
      setIsTyping(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 550 + Math.random() * 350);
  };

  const reset = () => {
    setMessages([{ id: "welcome", role: "bot", content: "Hi, I'm **Help Bot** — I can answer general questions about Overhaul alerts, cargo security, carrier verification, and shipment tracking.\n\nI don't have access to your live shipment data and can't take any actions. For account-specific help, switch to **Navigator** or **Resolution Agent**." }]);
    setInput("");
  };

  const grouped = Object.entries(
    HELPBOT_SUGGESTIONS.reduce<Record<string, string[]>>((acc, s) => {
      (acc[s.category] ??= []).push(s.text);
      return acc;
    }, {})
  );

  return (
    <div className="flex flex-col h-full">
      {/* Capability banner */}
      <div className="shrink-0 mx-6 mt-4 p-3 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-start gap-3">
        <HelpCircle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-300">
          <span className="font-semibold">Mode 1 — Help Bot:</span>{" "}
          Predefined answers only. No access to your shipment data. No planning, no tool use, no actions.
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "bot" && (
                <div className="h-7 w-7 rounded-full bg-slate-500/20 border border-slate-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-300" />
                </div>
              )}
              <div className={cn(
                "max-w-lg rounded-xl px-4 py-3 text-sm",
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
            <div className="h-7 w-7 rounded-full bg-slate-500/20 border border-slate-500/30 flex items-center justify-center shrink-0">
              <HelpCircle className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <div className="bg-[var(--mil-surface)] border border-[var(--mil-border)] rounded-xl px-4 py-3 flex items-center gap-1.5">
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.span key={i} className="h-1.5 w-1.5 bg-slate-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: d, repeat: Infinity }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Grouped suggestions */}
      {messages.length <= 2 && (
        <div className="shrink-0 px-6 pb-3 space-y-3">
          {grouped.map(([category, items]) => (
            <div key={category}>
              <p className={cn("text-[10px] font-semibold uppercase tracking-widest px-1 mb-1.5 inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5", CATEGORY_COLORS[category] ?? "text-[var(--mil-muted)]")}>
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white hover:border-slate-500/50 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-6 pb-6 pt-3 border-t border-[var(--mil-border)]">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask about tamper alerts, fraud, carrier flags, tracking…"
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:border-slate-500/50 disabled:opacity-50" />
          <button onClick={() => send(input)} disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-500 transition-colors disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
          <button onClick={reset}
            className="px-3 py-2.5 rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white transition-colors">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--mil-muted)] mt-2">
          Help Bot cannot access your account. Switch to Navigator for shipment-specific answers.
        </p>
      </div>
    </div>
  );
}
