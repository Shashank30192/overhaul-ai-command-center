"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, RotateCcw, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

const SUGGESTED = [
  "What is a route deviation?",
  "What is a risk score?",
  "What is TTS?",
  "What is double brokering?",
  "What is cold chain monitoring?",
  "What is a geofence?",
];

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    // Bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-1 leading-relaxed">
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="text-white font-semibold">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  });
}

export function ChatbotPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "Hello! I'm **RiskBot** — a basic risk information assistant.\n\nI can answer simple questions about supply chain risk concepts. I don't have access to your live platform data, and I can't take any actions.\n\nWhat would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiMode, setAiMode] = useState<string>("...");
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
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: historyRef.current }),
      });
      const data = await res.json() as { response: string; mode: string };
      const botMsg: Message = { id: `b-${Date.now()}`, role: "bot", content: data.response };
      setMessages((prev) => [...prev, botMsg]);
      setAiMode(data.mode);
      historyRef.current = [...historyRef.current, { role: "user" as const, content: trimmed }, { role: "assistant" as const, content: data.response }].slice(-16);
    } catch {
      setMessages((prev) => [...prev, { id: `b-err-${Date.now()}`, role: "bot", content: "Sorry, I couldn't connect to the AI. Please try again." }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const reset = () => {
    setMessages([{
      id: "welcome",
      role: "bot",
      content: "Hello! I'm **RiskBot** — a basic risk information assistant.\n\nI can answer simple questions about supply chain risk concepts. I don't have access to your live platform data, and I can't take any actions.\n\nWhat would you like to know?",
    }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Capability banner */}
      <div className="shrink-0 mx-6 mt-4 p-3 rounded-lg bg-[#00c2b2]/8 border border-[#00c2b2]/20 flex items-start gap-3">
        <Zap className="h-4 w-4 text-[#00c2b2] mt-0.5 shrink-0" />
        <div className="text-xs text-slate-300 flex-1">
          <span className="font-semibold text-[#00c2b2]">Mode 1 — RiskBot (Groq AI):</span>{" "}
          Powered by Llama 3.3-70B. Answers supply chain risk questions with real AI reasoning.
        </div>
        {aiMode !== "..." && (
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0",
            aiMode === "groq" ? "bg-[#00c2b2]/15 text-[#00c2b2]" : "bg-slate-500/20 text-slate-400"
          )}>{aiMode}</span>
        )}
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
              {msg.role === "bot" && (
                <div className="h-7 w-7 rounded-full bg-slate-500/20 border border-slate-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-slate-300" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-lg rounded-xl px-4 py-3 text-sm",
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
            <div className="h-7 w-7 rounded-full bg-slate-500/20 border border-slate-500/30 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <div className="bg-[var(--mil-surface)] border border-[var(--mil-border)] rounded-xl px-4 py-3 flex items-center gap-1.5">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 bg-slate-400 rounded-full"
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
        <div className="shrink-0 px-6 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-[var(--mil-muted)] mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-[var(--mil-surface)] border border-[var(--mil-border)] text-[var(--mil-muted)] hover:text-white hover:border-slate-500/50 transition-colors"
              >
                {s}
              </button>
            ))}
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
            placeholder="Ask RiskBot anything about supply chain risk…"
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-[var(--mil-surface)] border border-[var(--mil-border)] text-white placeholder:text-[var(--mil-muted)] focus:outline-none focus:border-slate-500/50 disabled:opacity-50"
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
          Powered by Groq · Llama 3.3-70B · Supply chain risk specialist
        </p>
      </div>
    </div>
  );
}
