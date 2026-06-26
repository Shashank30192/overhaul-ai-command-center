"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Server, Package, ShoppingCart, Plug, Bot, GitBranch,
  Activity, BarChart3, Settings, Bell, Search, Sun, Moon, ChevronRight,
  Wifi, AlertCircle, X, Zap, CheckCircle, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_SYSTEMS } from "./mock-data";

export type CTView = 'dashboard' | 'ai-command' | 'shipments' | 'orders' | 'integrations' | 'agents' | 'workflow' | 'api-monitor' | 'analytics' | 'settings' | 'studio';

interface NavItem { id: CTView; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string }

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai-command', label: 'AI Command', icon: Bot, badge: '●' },
  { id: 'shipments', label: 'Shipments', icon: Package, badge: 23 },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'agents', label: 'Agents', icon: Server },
  { id: 'studio', label: 'Ecosystem Studio', icon: Layers, badge: '✦' },
  { id: 'workflow', label: 'Workflow Studio', icon: GitBranch },
  { id: 'api-monitor', label: 'API Monitor', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const connectedCount = MOCK_SYSTEMS.filter(s => s.status === 'connected').length;

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111416] border border-[#00c2b2]/30 shadow-xl text-sm text-white">
      <CheckCircle className="h-4 w-4 text-[#00c2b2] shrink-0" />
      {msg}
      <button onClick={onClose}><X className="h-3.5 w-3.5 text-white/40 hover:text-white" /></button>
    </motion.div>
  );
}

interface CTShellProps {
  view: CTView;
  setView: (v: CTView) => void;
  children: React.ReactNode;
  toast?: string | null;
  clearToast?: () => void;
}

export function CTShell({ view, setView, children, toast, clearToast }: CTShellProps) {
  const [dark, setDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v); }
    if (e.key === 'Escape') { setSearchOpen(false); setNotifOpen(false); }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const SEARCH_ITEMS = NAV.map(n => ({ label: n.label, action: () => { setView(n.id); setSearchOpen(false); } }));

  const filtered = searchQ ? SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(searchQ.toLowerCase())) : SEARCH_ITEMS;

  const NOTIFS = [
    { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', title: 'SLA Breach Risk', body: 'SHP-1024 — Nexus Pharma PLATINUM in 2h', time: '2m ago' },
    { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10', title: 'Dock Equipment Failure', body: 'Dock 7-B forklift malfunction — Chicago WH', time: '8m ago' },
    { icon: Wifi, color: 'text-orange-400', bg: 'bg-orange-400/10', title: 'SAP EWM Degraded', body: 'API latency 387ms — above threshold', time: '15m ago' },
    { icon: CheckCircle, color: 'text-[#00c2b2]', bg: 'bg-[#00c2b2]/10', title: 'Resolution Complete', body: 'SHP-1019 expedited successfully', time: '31m ago' },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d0f10', color: 'white', fontFamily: 'inherit' }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/5" style={{ background: '#0a0c0d' }}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#00c2b2]/15 border border-[#00c2b2]/30 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-[#00c2b2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-tight">Control Tower</p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Supply Chain AI</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => setView(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group",
                  active
                    ? "bg-[#00c2b2]/10 text-[#00c2b2] border border-[#00c2b2]/20"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
                )}>
                <item.icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-[#00c2b2]" : "text-white/30 group-hover:text-white/60")} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                    item.badge === '●' ? "text-[#00c2b2] animate-pulse" : "bg-red-500/80 text-white"
                  )}>{item.badge}</span>
                )}
                {active && <ChevronRight className="h-3 w-3 text-[#00c2b2]/50" />}
              </button>
            );
          })}
        </nav>

        {/* System connections */}
        <div className="px-3 py-3 border-t border-white/5">
          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-2 px-1">Connected Systems</p>
          <div className="space-y-1">
            {[
              { label: 'SAP S/4HANA', color: 'bg-blue-400' },
              { label: 'Manhattan WMS', color: 'bg-amber-400' },
              { label: 'Oracle TMS', color: 'bg-purple-400' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-1 py-0.5">
                <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 animate-pulse", s.color)} />
                <span className="text-[10px] text-white/30 truncate">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-white/20 mt-2 px-1">{connectedCount}/10 systems online</p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-white/5" style={{ background: '#0d0f10' }}>
          {/* Search */}
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 h-7 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 text-xs text-white/30 hover:text-white/50 transition-all w-52">
            <Search className="h-3 w-3 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[9px] bg-white/5 px-1 rounded">⌘K</kbd>
          </button>

          <div className="flex-1" />

          {/* AI Status pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00c2b2]/8 border border-[#00c2b2]/20">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00c2b2] animate-pulse" />
            <span className="text-[10px] text-[#00c2b2] font-medium">5 Agents Active</span>
          </div>

          {/* Connected systems */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8">
            <Wifi className="h-3 w-3 text-white/40" />
            <span className="text-[10px] text-white/50">{connectedCount} Systems</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(v => !v)}
              className="relative h-7 w-7 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 flex items-center justify-center transition-all">
              <Bell className="h-3.5 w-3.5 text-white/40" />
              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">3</span>
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 top-9 w-80 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
                  style={{ background: '#111416' }}>
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

          {/* Dark mode */}
          <button onClick={() => setDark(v => !v)}
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 flex items-center justify-center transition-all">
            {dark ? <Moon className="h-3.5 w-3.5 text-white/40" /> : <Sun className="h-3.5 w-3.5 text-white/40" />}
          </button>

          {/* Profile */}
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#00c2b2]/60 to-[#00c2b2]/20 border border-[#00c2b2]/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#00c2b2]">S</span>
          </div>
        </header>

        {/* Content */}
        <main className={cn("flex-1 min-h-0", view === 'studio' ? "overflow-hidden" : "overflow-auto")} style={{ background: '#0d0f10' }}>
          {children}
        </main>
      </div>

      {/* Command palette */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSearchOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.97 }}
              className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-md z-50 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              style={{ background: '#111416' }}>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
                <Search className="h-4 w-4 text-white/30 shrink-0" />
                <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search views, shipments, systems..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none" />
                <button onClick={() => setSearchOpen(false)}><X className="h-4 w-4 text-white/30" /></button>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {filtered.map(item => (
                  <button key={item.label} onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-white/70 hover:text-white transition-colors text-left">
                    <ChevronRight className="h-3.5 w-3.5 text-white/20" />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && clearToast && <Toast msg={toast} onClose={clearToast} />}
      </AnimatePresence>
    </div>
  );
}
