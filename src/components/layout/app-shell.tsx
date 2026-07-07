"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Bot, ShieldAlert, Map, Building2,
  Activity, BarChart3, Crown, Settings,
  Search, Bell, X, Zap, ChevronRight, Cpu, Globe, AlertCircle,
  CheckCircle, Wifi, Package, FileWarning, TerminalSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

const STANDALONE = ["/control-tower"];

const NAV = [
  {
    group: "Intelligence",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/copilot", label: "AI Copilot", icon: Bot, dot: true },
      { href: "/risk", label: "Risk Monitor", icon: ShieldAlert, badge: 3 },
      { href: "/fraud-watch", label: "Fraud Watch", icon: AlertCircle, badge: 2 },
      { href: "/fraud", label: "Fraud Detection", icon: FileWarning },
    ],
  },
  {
    group: "Agentic Operations",
    items: [
      { href: "/self-service", label: "ACE", icon: Cpu, dot: true },
      { href: "/agent", label: "Agent Center", icon: TerminalSquare },
      { href: "/control-tower", label: "Inventory Federation", icon: Activity },
    ],
  },
  {
    group: "Analytics",
    items: [
      { href: "/digital-twin", label: "Digital Twin", icon: Globe },
      { href: "/executive", label: "Executive", icon: Crown },
    ],
  },
];

const NOTIFS = [
  { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", title: "SLA Breach Risk", body: "SHP-1024 — Nexus Pharma PLATINUM in 2h", time: "2m ago" },
  { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10", title: "Fraud Detected", body: "Double brokering on SHP-8821 lane", time: "11m ago" },
  { icon: Wifi, color: "text-orange-400", bg: "bg-orange-400/10", title: "SAP EWM Degraded", body: "API latency 387ms — above threshold", time: "18m ago" },
  { icon: CheckCircle, color: "text-[#00c2b2]", bg: "bg-[#00c2b2]/10", title: "Agent Complete", body: "SHP-1019 resolution flow finished", time: "34m ago" },
];

function Topbar({ notifOpen, setNotifOpen }: { notifOpen: boolean; setNotifOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const current = NAV.flatMap(g => g.items).find(i => i.href === pathname);

  return (
    <header
      className="h-11 shrink-0 flex items-center gap-3 px-4 border-b border-white/5"
      style={{ background: "#0d0f10" }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-white/30">
        <span>Overhaul</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white/70 font-medium">{current?.label ?? "App"}</span>
      </div>

      <div className="flex-1" />

      {/* AI status */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00c2b2]/8 border border-[#00c2b2]/20">
        <div className="h-1.5 w-1.5 rounded-full bg-[#00c2b2] animate-pulse" />
        <span className="text-[10px] text-[#00c2b2] font-medium">5 Agents Active</span>
      </div>

      {/* Systems */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8">
        <Wifi className="h-3 w-3 text-white/40" />
        <span className="text-[10px] text-white/50">8 Systems</span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative h-7 w-7 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 flex items-center justify-center transition-all"
        >
          <Bell className="h-3.5 w-3.5 text-white/40" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">3</span>
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute right-0 top-9 w-80 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
              style={{ background: "#111416" }}
            >
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <p className="text-xs font-semibold text-white">Notifications</p>
                <button onClick={() => setNotifOpen(false)}><X className="h-3.5 w-3.5 text-white/40" /></button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {NOTIFS.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/3 border-b border-white/5 last:border-0 cursor-pointer">
                    <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5", n.bg)}>
                      <n.icon className={cn("h-3 w-3", n.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white">{n.title}</p>
                      <p className="text-[11px] text-white/40 mt-0.5 truncate">{n.body}</p>
                      <p className="text-[10px] text-white/25 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar */}
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#00c2b2]/60 to-[#00c2b2]/20 border border-[#00c2b2]/30 flex items-center justify-center">
        <span className="text-[10px] font-bold text-[#00c2b2]">S</span>
      </div>
    </header>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 flex flex-col border-r border-white/5" style={{ background: "#0a0c0d" }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#00c2b2]/15 border border-[#00c2b2]/30 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-[#00c2b2]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-tight">Overhaul AI</p>
            <p className="text-[9px] text-white/30 uppercase tracking-widest">Command Center</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="text-[9px] text-white/20 uppercase tracking-widest px-3 mb-1">{section.group}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group",
                      active
                        ? "bg-[#00c2b2]/10 text-[#00c2b2] border border-[#00c2b2]/20"
                        : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
                    )}>
                    <item.icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-[#00c2b2]" : "text-white/30 group-hover:text-white/60")} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/80 text-white">{item.badge}</span>
                    )}
                    {"dot" in item && item.dot && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00c2b2] animate-pulse" />
                    )}
                    {active && <ChevronRight className="h-3 w-3 text-[#00c2b2]/50" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom system status */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="space-y-1">
          {[
            { label: "SAP S/4HANA", color: "bg-blue-400" },
            { label: "Manhattan WMS", color: "bg-amber-400" },
            { label: "Oracle TMS", color: "bg-purple-400" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-1 py-0.5">
              <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 animate-pulse", s.color)} />
              <span className="text-[10px] text-white/30 truncate">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-white/20 mt-2 px-1">8/10 systems online</p>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setNotifOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Standalone pages manage their own full-screen shell
  if (STANDALONE.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d0f10", color: "white" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar notifOpen={notifOpen} setNotifOpen={setNotifOpen} />
        <main className="flex-1 overflow-auto" style={{ background: "#0d0f10" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
