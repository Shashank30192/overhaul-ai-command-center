"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Pause, Play, RefreshCw, X, ChevronRight, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_TEMPLATES, MOCK_PAYLOADS, type ApiLog } from "./mock-data";

let logCounter = 0;
function makeLog(): ApiLog {
  const tpl = API_TEMPLATES[logCounter % API_TEMPLATES.length];
  logCounter++;
  return { ...tpl, id: `log-${Date.now()}-${logCounter}`, timestamp: Date.now() };
}

type PayloadTab = 'headers' | 'request' | 'response' | 'timeline' | 'json';

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-blue-400 bg-blue-400/10',
  POST: 'text-emerald-400 bg-emerald-400/10',
  PUT: 'text-amber-400 bg-amber-400/10',
  DELETE: 'text-red-400 bg-red-400/10',
};
const STATUS_COLOR = (s: number) =>
  s < 300 ? 'text-emerald-400' : s < 400 ? 'text-amber-400' : s < 500 ? 'text-orange-400' : 'text-red-400';

export function CTApiMonitor() {
  const [logs, setLogs] = useState<ApiLog[]>(() => Array.from({ length: 12 }, makeLog));
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<ApiLog | null>(null);
  const [tab, setTab] = useState<PayloadTab>('response');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      const newLog = makeLog();
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 1500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused]);

  const payloadData = selected
    ? MOCK_PAYLOADS[selected.agent === 'ERP Agent' ? 'erp' : selected.agent === 'WMS Agent' ? 'wms' : selected.agent === 'TMS Agent' ? 'tms' : 'decision']
    : null;

  return (
    <div className="p-5 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#00c2b2]" />
          <h2 className="text-base font-bold text-white">API Monitor</h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00c2b2]/8 border border-[#00c2b2]/20">
            {!paused && <div className="h-1.5 w-1.5 rounded-full bg-[#00c2b2] animate-pulse" />}
            <span className="text-[10px] text-[#00c2b2]">{paused ? 'Paused' : 'Live'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setLogs([]); logCounter = 0; }}
            className="h-7 px-3 rounded-lg text-xs text-white/50 hover:text-white border border-white/8 hover:bg-white/5 transition-all flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3" /> Clear
          </button>
          <button onClick={() => setPaused(v => !v)}
            className="h-7 px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border"
            style={paused ? { background: '#00c2b220', color: '#00c2b2', borderColor: '#00c2b230' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.08)' }}>
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Log feed */}
        <div className="flex-1 min-w-0 rounded-xl border border-white/6 overflow-hidden flex flex-col" style={{ background: '#111416' }}>
          {/* Column headers */}
          <div className="px-3 py-2 border-b border-white/5 grid gap-2 text-[9px] text-white/25 uppercase tracking-widest font-medium"
            style={{ gridTemplateColumns: '60px 1fr 60px 70px 80px 36px' }}>
            <span>Method</span><span>Endpoint</span><span>Status</span><span>Latency</span><span>Agent</span><span></span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence initial={false}>
              {logs.map(log => (
                <motion.div key={log.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSelected(log === selected ? null : log)}
                  className={cn(
                    "px-3 py-2 border-b border-white/4 cursor-pointer hover:bg-white/3 transition-colors grid gap-2 items-center",
                    selected?.id === log.id && "bg-[#00c2b2]/5 border-[#00c2b2]/10"
                  )}
                  style={{ gridTemplateColumns: '60px 1fr 60px 70px 80px 36px' }}>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded text-center", METHOD_COLORS[log.method])}>
                    {log.method}
                  </span>
                  <span className="text-[11px] font-mono text-white/60 truncate">{log.endpoint}</span>
                  <span className={cn("text-xs font-bold", STATUS_COLOR(log.status))}>{log.status}</span>
                  <span className={cn("text-xs font-mono", log.latency > 500 ? 'text-red-400' : log.latency > 250 ? 'text-amber-400' : 'text-white/50')}>
                    {log.latency}ms
                  </span>
                  <span className="text-[10px] text-white/35 truncate">{log.agent}</span>
                  <button className="text-white/20 hover:text-[#00c2b2] transition-colors">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* Stats bar */}
          <div className="px-3 py-2 border-t border-white/5 flex items-center gap-4">
            {[
              { label: 'Total', val: logs.length, color: 'text-white/50' },
              { label: '2xx', val: logs.filter(l => l.status < 300).length, color: 'text-emerald-400' },
              { label: '4xx/5xx', val: logs.filter(l => l.status >= 400).length, color: 'text-red-400' },
              { label: 'Avg', val: `${Math.round(logs.reduce((a, l) => a + l.latency, 0) / (logs.length || 1))}ms`, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="text-[9px] text-white/25">{s.label}</span>
                <span className={cn("text-[10px] font-bold", s.color)}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payload drawer */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, x: 20, width: 0 }} animate={{ opacity: 1, x: 0, width: 360 }} exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 rounded-xl border border-white/6 overflow-hidden flex flex-col" style={{ background: '#111416' }}>
              {/* Drawer header */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", METHOD_COLORS[selected.method])}>{selected.method}</span>
                  <span className="text-xs font-mono text-white/60 truncate max-w-[180px]">{selected.endpoint}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Meta row */}
              <div className="px-4 py-2 border-b border-white/5 flex items-center gap-3">
                <span className={cn("text-xs font-bold", STATUS_COLOR(selected.status))}>{selected.status}</span>
                <div className="flex items-center gap-1 text-[10px] text-white/35"><Clock className="h-3 w-3" />{selected.latency}ms</div>
                <div className="flex items-center gap-1 text-[10px] text-white/35"><ArrowUpRight className="h-3 w-3" />{selected.size}</div>
                <span className="text-[10px] text-white/35 ml-auto">{selected.agent}</span>
              </div>

              {/* Tabs */}
              <div className="px-4 pt-2 pb-1 flex gap-1 border-b border-white/5">
                {(['headers', 'request', 'response', 'timeline', 'json'] as PayloadTab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn("text-[10px] px-2.5 py-1 rounded-md capitalize transition-all",
                      tab === t ? "bg-white/8 text-white font-medium" : "text-white/30 hover:text-white/60")}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-auto p-4 text-[11px]">
                {tab === 'headers' && payloadData && (
                  <div className="space-y-2">
                    {Object.entries(payloadData.headers).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-white/30 w-36 shrink-0 font-mono">{k}</span>
                        <span className="text-white/60 font-mono break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'request' && payloadData && (
                  <pre className="font-mono text-white/50 leading-relaxed whitespace-pre-wrap text-[10px]">
                    {JSON.stringify(payloadData.request, null, 2)}
                  </pre>
                )}
                {tab === 'response' && payloadData && (
                  <pre className="font-mono text-white/50 leading-relaxed whitespace-pre-wrap text-[10px]">
                    {JSON.stringify(payloadData.response, null, 2)}
                  </pre>
                )}
                {tab === 'timeline' && (
                  <div className="space-y-3">
                    {[
                      { label: 'DNS Lookup', ms: 2 }, { label: 'TCP Connect', ms: 8 }, { label: 'TLS Handshake', ms: 24 },
                      { label: 'Request Sent', ms: 4 }, { label: 'Server Processing', ms: selected.latency - 50 }, { label: 'Response Received', ms: 12 },
                    ].map(t => (
                      <div key={t.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-white/40">{t.label}</span>
                          <span className="text-white/60 font-mono">{t.ms}ms</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5">
                          <div className="h-1.5 rounded-full bg-[#00c2b2]" style={{ width: `${(t.ms / selected.latency) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'json' && payloadData && (
                  <pre className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                    <span className="text-purple-400">{"{\n"}</span>
                    <span className="text-blue-400">  "status"</span>: <span className="text-emerald-400">{selected.status}</span>,{"\n"}
                    <span className="text-blue-400">  "latency"</span>: <span className="text-amber-400">{selected.latency}</span>,{"\n"}
                    <span className="text-blue-400">  "data"</span>: <span className="text-white/40">{JSON.stringify(payloadData.response).slice(0, 100)}...</span>{"\n"}
                    <span className="text-purple-400">{"}"}</span>
                  </pre>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
