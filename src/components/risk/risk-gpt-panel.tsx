"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send, Bell, Shield, AlertTriangle, GripHorizontal, X, MessageSquare, FileText } from "lucide-react";
import type { Shipment } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "notes" | "chat";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time?: string;
  author?: string;
};

interface RiskGptPanelProps {
  shipment: Shipment;
}

function fmt(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      return <p key={i} className="text-gray-300 ml-3 text-[11px]">· {line.slice(2).replace(/\*\*/g, "")}</p>;
    }
    return <p key={i} className="text-gray-300 text-[11px] mb-0.5">{line.replace(/\*\*/g, "")}</p>;
  });
}

export function RiskGptPanel({ shipment }: RiskGptPanelProps) {
  const [tab, setTab] = useState<Tab>("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState<ChatMessage[]>([
    {
      id: "n-auto-1",
      role: "assistant",
      content: "Investigation started",
      time: "15:02 CST",
      author: "system",
    },
    {
      id: "n-auto-2",
      role: "user",
      content: "Called the driver to get a reason for the stop but no answer. Contacting the carrier dispatch now.",
      time: "15:06 CST",
      author: "Nick Fury",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(async (text: string, silent = false) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      author: "Nick Fury",
    };

    if (!silent) {
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
    }
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/riskgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, shipmentId: shipment.id, history }),
      });
      const data = await res.json();
      const aMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.response as string,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        author: "RiskGPT",
      };
      if (silent) setMessages([aMsg]);
      else setMessages((prev) => [...prev, aMsg]);
    } catch {
      const fallback: ChatMessage = {
        id: `a-err-${Date.now()}`,
        role: "assistant",
        content: `Risk score ${shipment.riskScore}% · Theft probability ${shipment.theftProbability}%. ${shipment.recommendedAction}`,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        author: "RiskGPT",
      };
      if (silent) setMessages([fallback]);
      else setMessages((prev) => [...prev, fallback]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, shipment]);

  useEffect(() => {
    setMessages([]);
    setInput("");
    void sendMessage("Provide a concise risk analysis and top 3 recommended actions for this active alert.", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipment.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, notes]);

  const handleAddNote = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setNotes((prev) => [...prev, {
      id: `note-${Date.now()}`,
      role: "user",
      content: trimmed,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      author: "Nick Fury",
    }]);
    setInput("");
  };

  const eventTitle = `Light & Stop (Compo... — ${shipment.id.replace(/\D/g, "").slice(0, 7)}`;

  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-[420px] max-w-[calc(100%-2rem)] shadow-2xl">
      <div className="rounded-xl overflow-hidden border border-white/10" style={{ background: "#111416" }}>

        {/* Title bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/8 bg-[#181c1f]">
          <GripHorizontal className="h-3.5 w-3.5 text-gray-600 shrink-0" />
          <p className="text-xs text-gray-200 font-medium truncate flex-1">Notes — {eventTitle}</p>
          <div className="flex items-center gap-1 shrink-0">
            <button className="p-1 rounded hover:bg-white/8 text-gray-500 hover:text-gray-300"><Bell className="h-3.5 w-3.5" /></button>
            <button className="p-1 rounded hover:bg-white/8 text-gray-500 hover:text-gray-300 text-sm font-bold">⋮</button>
            <button className="p-1 rounded hover:bg-white/8 text-gray-500 hover:text-gray-300"><X className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8">
          {([
            { id: "notes" as Tab, icon: FileText, label: "Notes" },
            { id: "chat" as Tab, icon: MessageSquare, label: "Chat with RiskGPT" },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
                tab === id ? "border-[#00c2b2] text-[#00c2b2]" : "border-transparent text-gray-500 hover:text-gray-300"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="h-52 overflow-y-auto px-4 py-3 space-y-3">

          {tab === "notes" && (
            <>
              {/* Date separator */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[10px] text-gray-600">Jan 02, 2026</span>
                <div className="flex-1 h-px bg-white/6" />
              </div>

              {notes.map((n) => (
                <div key={n.id} className={cn("flex gap-2.5", n.author === "system" ? "items-center" : "items-start")}>
                  {n.author === "system" ? (
                    <>
                      <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                        <span className="text-[10px]">🕐</span>
                      </div>
                      <p className="text-xs text-gray-400 italic flex-1">{n.content}</p>
                      <span className="text-[10px] text-gray-600 shrink-0">{n.time}</span>
                    </>
                  ) : (
                    <>
                      <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
                        {n.author?.split(" ").map(w => w[0]).join("") ?? "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-semibold text-white">{n.author}</span>
                          <span className="text-[10px] text-gray-600">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-relaxed">{n.content}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}

          {tab === "chat" && (
            <>
              {messages.length === 0 && loading && (
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  RiskGPT analyzing {shipment.id}…
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2.5 items-start", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-[#00c2b2]/20 text-[#00c2b2] border border-[#00c2b2]/30"
                  )}>
                    {msg.role === "user" ? "NF" : "AI"}
                  </div>
                  <div className={cn("max-w-[80%] rounded-xl px-3 py-2 text-[11px]",
                    msg.role === "user" ? "bg-blue-600/20 border border-blue-500/20 text-blue-100 rounded-tr-sm" : "bg-white/5 border border-white/6 text-gray-300 rounded-tl-sm"
                  )}>
                    {msg.role === "user" ? msg.content : fmt(msg.content)}
                    <p className="text-[9px] text-gray-600 mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
              {loading && messages.length > 0 && (
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" /> RiskGPT thinking…
                </div>
              )}
            </>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-3 py-2.5 border-t border-white/8 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (tab === "notes") handleAddNote();
                else void sendMessage(input);
              }
            }}
            placeholder={tab === "notes" ? "Add note…" : "Ask RiskGPT about this alert…"}
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00c2b2]/40 disabled:opacity-50"
          />
          <button
            onClick={tab === "notes" ? handleAddNote : () => void sendMessage(input)}
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-[#00c2b2] hover:bg-[#00a89a] text-white disabled:opacity-40 transition-colors"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Action row */}
        <div className="px-3 py-2 border-t border-white/6 flex items-center gap-2">
          {[
            { icon: Bell, label: "Subscribe", color: "text-gray-500" },
            { icon: Shield, label: "Waive", color: "text-blue-400" },
            { icon: AlertTriangle, label: "Escalate", color: "text-red-400" },
          ].map(({ icon: Icon, label, color }) => (
            <button key={label} className={cn("flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border border-white/8 hover:bg-white/5 transition-colors", color)}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
