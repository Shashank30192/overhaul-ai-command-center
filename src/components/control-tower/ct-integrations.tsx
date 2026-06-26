"use client";

import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Wifi, Activity, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_SYSTEMS, type EnterpriseSystem } from "./mock-data";

const TYPE_COLORS: Record<string, string> = {
  ERP: '#3b82f6',
  WMS: '#f59e0b',
  TMS: '#8b5cf6',
};

const STATUS_CONFIG = {
  connected: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', dot: 'bg-emerald-400', label: 'Connected' },
  degraded: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', dot: 'bg-amber-400', label: 'Degraded' },
  disconnected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', dot: 'bg-red-400', label: 'Disconnected' },
};

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1 rounded-full bg-white/5 flex-1">
      <div className="h-1 rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );
}

function SystemCard({ sys, index, onToast }: { sys: EnterpriseSystem; index: number; onToast: (m: string) => void }) {
  const cfg = STATUS_CONFIG[sys.status];
  const typeColor = TYPE_COLORS[sys.type];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      className="rounded-xl border border-white/6 p-4 hover:border-white/10 transition-all" style={{ background: '#111416' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold border"
            style={{ background: typeColor + '15', color: typeColor, borderColor: typeColor + '30' }}>
            {sys.type}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{sys.name}</p>
            <p className="text-[10px] text-white/35">{sys.vendor} · {sys.version}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium", cfg.bg, cfg.border, cfg.color)}>
          <div className={cn("h-1.5 w-1.5 rounded-full", cfg.dot, sys.status === 'connected' && 'animate-pulse')} />
          {cfg.label}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: 'Latency', value: sys.status === 'disconnected' ? '—' : `${sys.latency}ms`, icon: Clock, alert: sys.latency > 300 },
          { label: 'Last Sync', value: sys.lastSync, icon: RefreshCw, alert: false },
          { label: 'Req/min', value: sys.status === 'disconnected' ? '0' : `${sys.requestsPerMin}`, icon: Activity, alert: false },
          { label: 'Uptime', value: sys.uptime, icon: Wifi, alert: parseFloat(sys.uptime) < 99 },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-2 p-2 rounded-lg bg-white/3">
            <m.icon className={cn("h-3 w-3 shrink-0", m.alert ? 'text-amber-400' : 'text-white/20')} />
            <div>
              <p className={cn("text-xs font-medium", m.alert ? 'text-amber-400' : 'text-white/70')}>{m.value}</p>
              <p className="text-[9px] text-white/25">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* API Health bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-white/30">API Health</span>
          <span className={cn("text-[10px] font-bold", sys.apiHealth > 95 ? 'text-emerald-400' : sys.apiHealth > 80 ? 'text-amber-400' : 'text-red-400')}>
            {sys.apiHealth}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5">
          <div className="h-1.5 rounded-full transition-all" style={{
            width: `${sys.apiHealth}%`,
            background: sys.apiHealth > 95 ? '#10b981' : sys.apiHealth > 80 ? '#f59e0b' : '#ef4444'
          }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-white/30">
          <span>{sys.endpoints} endpoints</span>
          <span className="text-white/15">·</span>
          <span className={sys.errorRate > 1 ? 'text-red-400' : 'text-white/30'}>{sys.errorRate}% error</span>
        </div>
        <button onClick={() => onToast(`Syncing ${sys.name}...`)}
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-[#00c2b2] transition-colors">
          <RefreshCw className="h-3 w-3" /> Sync
        </button>
      </div>
    </motion.div>
  );
}

export function CTIntegrations({ onToast }: { onToast: (m: string) => void }) {
  const grouped = {
    ERP: MOCK_SYSTEMS.filter(s => s.type === 'ERP'),
    WMS: MOCK_SYSTEMS.filter(s => s.type === 'WMS'),
    TMS: MOCK_SYSTEMS.filter(s => s.type === 'TMS'),
  };

  const stats = {
    connected: MOCK_SYSTEMS.filter(s => s.status === 'connected').length,
    degraded: MOCK_SYSTEMS.filter(s => s.status === 'degraded').length,
    disconnected: MOCK_SYSTEMS.filter(s => s.status === 'disconnected').length,
    avgLatency: Math.round(MOCK_SYSTEMS.filter(s => s.latency > 0).reduce((a, s) => a + s.latency, 0) / MOCK_SYSTEMS.filter(s => s.latency > 0).length),
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Enterprise Integrations</h2>
          <p className="text-xs text-white/40 mt-0.5">ERP · WMS · TMS — real-time system health</p>
        </div>
        <button onClick={() => onToast('Refreshing all system connections...')}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs text-white/50 hover:text-white border border-white/8 hover:bg-white/5 transition-all">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh All
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Connected', value: stats.connected, color: '#10b981' },
          { label: 'Degraded', value: stats.degraded, color: '#f59e0b' },
          { label: 'Disconnected', value: stats.disconnected, color: '#ef4444' },
          { label: 'Avg Latency', value: `${stats.avgLatency}ms`, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/6 p-3 text-center" style={{ background: '#111416' }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-white/35 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* System groups */}
      {(Object.entries(grouped) as [string, EnterpriseSystem[]][]).map(([type, systems]) => (
        <div key={type}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-10 rounded flex items-center justify-center text-[9px] font-bold"
              style={{ background: TYPE_COLORS[type] + '20', color: TYPE_COLORS[type] }}>
              {type}
            </div>
            <h3 className="text-sm font-semibold text-white">
              {type === 'ERP' ? 'Enterprise Resource Planning' : type === 'WMS' ? 'Warehouse Management' : 'Transportation Management'}
            </h3>
            <span className="text-[10px] text-white/30 ml-auto">{systems.length} systems</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {systems.map((sys, i) => <SystemCard key={sys.id} sys={sys} index={i} onToast={onToast} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
