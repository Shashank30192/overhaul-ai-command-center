"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package, AlertTriangle, ShoppingCart, Plug, Brain, Bot, Clock, Bell,
  TrendingUp, TrendingDown, Minus, ChevronRight, ArrowUpRight, Filter,
  Download, Search, SortAsc, SortDesc, CheckSquare, Square
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { MOCK_SHIPMENTS, type Shipment, type ShipmentStatus, type RiskLevel, type Priority } from "./mock-data";

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const SPARK_DATA = (vals: number[]) => vals.map((v, i) => ({ i, v }));

const KPI_CARDS = [
  { label: 'Active Shipments', value: '847', sub: '+12 today', trend: 'up' as const, icon: Package, color: '#3b82f6', spark: SPARK_DATA([60,65,62,70,68,75,72,80,78,85,82,90]) },
  { label: 'Delayed', value: '23', sub: '↑4 from yesterday', trend: 'down' as const, icon: AlertTriangle, color: '#ef4444', spark: SPARK_DATA([10,12,11,14,13,16,15,18,19,21,22,23]) },
  { label: 'Orders Today', value: '1,248', sub: '+186 vs avg', trend: 'up' as const, icon: ShoppingCart, color: '#00c2b2', spark: SPARK_DATA([800,900,850,950,1000,1050,1100,1000,1150,1200,1230,1248]) },
  { label: 'Connected Systems', value: '8/10', sub: '2 degraded', trend: 'neutral' as const, icon: Plug, color: '#f59e0b', spark: SPARK_DATA([9,9,10,10,9,8,9,10,9,8,8,8]) },
  { label: 'AI Decisions', value: '1,847', sub: 'Last 24h', trend: 'up' as const, icon: Brain, color: '#8b5cf6', spark: SPARK_DATA([100,120,140,130,160,180,175,190,200,210,220,230]) },
  { label: 'Running Agents', value: '5', sub: 'All healthy', trend: 'up' as const, icon: Bot, color: '#00c2b2', spark: SPARK_DATA([3,4,4,5,5,5,4,5,5,5,5,5]) },
  { label: 'Avg API Latency', value: '187ms', sub: '↑12ms spike', trend: 'neutral' as const, icon: Clock, color: '#6366f1', spark: SPARK_DATA([140,155,148,162,158,170,165,175,180,182,185,187]) },
  { label: 'Critical Alerts', value: '3', sub: '↓2 resolved', trend: 'up' as const, icon: Bell, color: '#ef4444', spark: SPARK_DATA([8,7,6,6,5,5,4,4,3,3,3,3]) },
];

function Sparkline({ data, color }: { data: { i: number; v: number }[]; color: string }) {
  return (
    <div style={{ width: '100%', height: 32 }}>
      <ResponsiveContainer width="100%" height={32}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Status / Risk pill helpers ───────────────────────────────────────────────

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  in_transit: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  delayed: 'bg-red-500/15 text-red-300 border-red-500/20',
  at_risk: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  pending: 'bg-white/10 text-white/50 border-white/10',
  exception: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  on_hold: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
};
const STATUS_LABEL: Record<ShipmentStatus, string> = {
  in_transit: 'In Transit', delayed: 'Delayed', at_risk: 'At Risk',
  delivered: 'Delivered', pending: 'Pending', exception: 'Exception', on_hold: 'On Hold',
};

const RISK_STYLES: Record<RiskLevel, string> = {
  low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400',
};
const PRIORITY_STYLES: Record<Priority, string> = {
  STANDARD: 'bg-white/5 text-white/40 border-white/8',
  HIGH: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  PLATINUM: 'bg-[#00c2b2]/10 text-[#00c2b2] border-[#00c2b2]/20',
  CRITICAL: 'bg-red-500/10 text-red-300 border-red-500/20',
};

type SortKey = keyof Shipment;
type SortDir = 'asc' | 'desc';

interface CTDashboardProps {
  onShipmentClick: (s: Shipment) => void;
  onToast: (msg: string) => void;
}

export function CTDashboard({ onShipmentClick, onToast }: CTDashboardProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const PAGE_SIZE = 15;

  const filtered = useMemo(() => {
    let r = [...MOCK_SHIPMENTS];
    if (search) r = r.filter(s =>
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.carrier.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') r = r.filter(s => s.status === statusFilter);
    if (riskFilter !== 'all') r = r.filter(s => s.risk === riskFilter);
    r.sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return r;
  }, [search, statusFilter, riskFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => setSelected(s => s.size === pageRows.length ? new Set() : new Set(pageRows.map(r => r.id)));

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <SortAsc className="h-3 w-3 text-white/20" />;
    return sortDir === 'asc' ? <SortAsc className="h-3 w-3 text-[#00c2b2]" /> : <SortDesc className="h-3 w-3 text-[#00c2b2]" />;
  };

  return (
    <div className="p-5 space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3">
        {KPI_CARDS.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-white/6 p-4 flex flex-col gap-2 hover:border-white/10 transition-colors cursor-pointer group"
            style={{ background: '#111416' }}>
            <div className="flex items-center justify-between">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18` }}>
                <k.icon className="h-3.5 w-3.5" style={{ color: k.color }} />
              </div>
              <div className={cn("flex items-center gap-0.5 text-[10px] font-medium",
                k.trend === 'up' ? 'text-emerald-400' : k.trend === 'down' ? 'text-red-400' : 'text-white/30')}>
                {k.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : k.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">{k.value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{k.label}</p>
            </div>
            <div className="-mx-1">
              <Sparkline data={k.spark} color={k.color} />
            </div>
            <p className="text-[10px] text-white/25">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Shipment Grid */}
      <div className="rounded-xl border border-white/6 overflow-hidden" style={{ background: '#111416' }}>
        {/* Table toolbar */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1">
            <Package className="h-4 w-4 text-white/30" />
            <h2 className="text-sm font-semibold text-white">Shipments</h2>
            <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 h-7 rounded-lg bg-white/5 border border-white/8 w-48">
            <Search className="h-3 w-3 text-white/30 shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search ID, customer..." className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none" />
          </div>

          {/* Status filter */}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as ShipmentStatus | 'all'); setPage(1); }}
            className="h-7 px-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/60 outline-none cursor-pointer">
            <option value="all">All Status</option>
            {(Object.keys(STATUS_LABEL) as ShipmentStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>

          {/* Risk filter */}
          <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value as RiskLevel | 'all'); setPage(1); }}
            className="h-7 px-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/60 outline-none cursor-pointer">
            <option value="all">All Risk</option>
            {(['critical', 'high', 'medium', 'low'] as RiskLevel[]).map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>

          <button onClick={() => { onToast(`Exported ${selected.size || filtered.length} shipments as CSV`); }}
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 text-xs text-white/50 hover:text-white/80 transition-all">
            <Download className="h-3 w-3" /> Export
          </button>
          <button className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 text-xs text-white/50 hover:text-white/80 transition-all">
            <Filter className="h-3 w-3" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 1100 }}>
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-3 py-2.5 text-left">
                  <button onClick={toggleAll}>
                    {selected.size === pageRows.length && pageRows.length > 0
                      ? <CheckSquare className="h-3.5 w-3.5 text-[#00c2b2]" />
                      : <Square className="h-3.5 w-3.5 text-white/20" />}
                  </button>
                </th>
                {[
                  { label: 'Shipment ID', key: 'id' as SortKey },
                  { label: 'Customer', key: 'customer' as SortKey },
                  { label: 'Priority', key: 'priority' as SortKey },
                  { label: 'Origin → Destination', key: 'origin' as SortKey },
                  { label: 'Carrier', key: 'carrier' as SortKey },
                  { label: 'ETA', key: 'eta' as SortKey },
                  { label: 'Risk', key: 'riskScore' as SortKey },
                  { label: 'Status', key: 'status' as SortKey },
                  { label: 'AI Recommendation', key: null },
                  { label: '', key: null },
                ].map(col => (
                  <th key={col.label} onClick={() => col.key && toggleSort(col.key)}
                    className={cn("px-3 py-2.5 text-left text-[10px] font-medium text-white/30 uppercase tracking-wider whitespace-nowrap select-none", col.key && "cursor-pointer hover:text-white/60")}>
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon k={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className={cn("border-b border-white/4 hover:bg-white/3 transition-colors cursor-pointer",
                    selected.has(row.id) && "bg-[#00c2b2]/4")}
                  onClick={() => onShipmentClick(row)}>
                  <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(row.id); }}>
                    {selected.has(row.id)
                      ? <CheckSquare className="h-3.5 w-3.5 text-[#00c2b2]" />
                      : <Square className="h-3.5 w-3.5 text-white/15" />}
                  </td>
                  <td className="px-3 py-2.5">
                    <div>
                      <p className="font-mono font-medium text-white/90">{row.id}</p>
                      <p className="text-white/30 text-[10px]">{row.salesOrder}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-white/80 font-medium truncate max-w-[120px]">{row.customer}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide", PRIORITY_STYLES[row.priority])}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-white/60 whitespace-nowrap">{row.origin} <span className="text-white/25">→</span> {row.destination}</p>
                  </td>
                  <td className="px-3 py-2.5 text-white/50 whitespace-nowrap">{row.carrier}</td>
                  <td className="px-3 py-2.5 text-white/50 whitespace-nowrap">{row.eta}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-1.5 w-1.5 rounded-full",
                        row.risk === 'critical' ? 'bg-red-400 animate-pulse' :
                        row.risk === 'high' ? 'bg-orange-400' :
                        row.risk === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                      )} />
                      <span className={cn("font-medium capitalize", RISK_STYLES[row.risk])}>{row.risk}</span>
                      <span className="text-white/25">({row.riskScore})</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border", STATUS_STYLES[row.status])}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 max-w-[180px]">
                    <p className="text-white/40 truncate text-[11px]">{row.aiRecommendation}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={e => { e.stopPropagation(); onShipmentClick(row); }}
                      className="text-white/20 hover:text-[#00c2b2] transition-colors">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
          <p className="text-[11px] text-white/30">
            {selected.size > 0 && <span className="text-[#00c2b2] mr-2">{selected.size} selected ·</span>}
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-6 w-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all text-xs">‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return p <= totalPages ? (
                <button key={p} onClick={() => setPage(p)}
                  className={cn("h-6 w-6 rounded text-xs transition-all",
                    p === page ? "bg-[#00c2b2]/20 text-[#00c2b2] font-medium" : "text-white/40 hover:text-white hover:bg-white/5")}>
                  {p}
                </button>
              ) : null;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="h-6 w-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all text-xs">›</button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/30">Go to</span>
            <input type="number" min={1} max={totalPages} defaultValue={page}
              onBlur={e => { const v = parseInt(e.target.value); if (v >= 1 && v <= totalPages) setPage(v); }}
              className="w-10 h-6 px-1 rounded bg-white/5 border border-white/8 text-xs text-white/60 outline-none text-center" />
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'On-Time Delivery Rate', value: '94.2%', bar: 94, color: '#00c2b2' },
          { label: 'Carrier Performance', value: '87.6%', bar: 88, color: '#3b82f6' },
          { label: 'Warehouse Efficiency', value: '91.8%', bar: 92, color: '#8b5cf6' },
          { label: 'AI Resolution Rate', value: '96.4%', bar: 96, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-white/6 p-4" style={{ background: '#111416' }}>
            <p className="text-[11px] text-white/40 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-white mb-2">{stat.value}</p>
            <div className="h-1 rounded-full bg-white/5">
              <div className="h-1 rounded-full transition-all" style={{ width: `${stat.bar}%`, background: stat.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
