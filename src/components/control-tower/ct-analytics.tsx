"use client";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SHIPMENT_TREND = MONTHS.map((m, i) => ({
  month: m,
  onTime: 750 + i * 12 + Math.floor(Math.sin(i) * 40),
  delayed: 95 - i * 3 + Math.floor(Math.cos(i) * 10),
  exceptions: 18 - i + Math.floor(Math.random() * 5),
}));

const LATENCY_TREND = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  p50: 120 + Math.floor(Math.sin(i / 3) * 40),
  p95: 210 + Math.floor(Math.sin(i / 3) * 80),
  p99: 340 + Math.floor(Math.cos(i / 4) * 100),
}));

const AGENT_PERFORMANCE = [
  { name: 'Supervisor', tasks: 1248, success: 1235, errorRate: 1.0 },
  { name: 'ERP Agent', tasks: 4820, success: 4805, errorRate: 0.3 },
  { name: 'WMS Agent', tasks: 3614, success: 3580, errorRate: 0.9 },
  { name: 'TMS Agent', tasks: 3102, success: 3087, errorRate: 0.5 },
  { name: 'Decision', tasks: 1248, success: 1240, errorRate: 0.6 },
];

const RISK_DISTRIBUTION = [
  { name: 'Low', value: 55, color: '#10b981' },
  { name: 'Medium', value: 28, color: '#f59e0b' },
  { name: 'High', value: 12, color: '#f97316' },
  { name: 'Critical', value: 5, color: '#ef4444' },
];

const CARRIER_PERFORMANCE = [
  { name: 'Swift Logistics', onTime: 94, incidents: 2, score: 92 },
  { name: 'Apex Freight', onTime: 91, incidents: 4, score: 88 },
  { name: 'GlobalCargo', onTime: 97, incidents: 1, score: 96 },
  { name: 'Meridian Transport', onTime: 88, incidents: 6, score: 84 },
  { name: 'NorthStar Shipping', onTime: 95, incidents: 2, score: 93 },
];

const RESOLUTION_TIME = MONTHS.map((m, i) => ({
  month: m,
  auto: 8 - i * 0.3 + Math.sin(i) * 1.5,
  manual: 24 - i * 0.8 + Math.cos(i) * 2,
}));

const TOOLTIP_STYLE = {
  contentStyle: { background: '#111416', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  labelStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/6 p-4" style={{ background: '#111416' }}>
      <div className="mb-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        {sub && <p className="text-[10px] text-white/35 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function CTAnalytics() {
  return (
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-base font-bold text-white">Analytics</h2>
        <p className="text-xs text-white/40 mt-0.5">Supply chain intelligence — last 12 months</p>
      </div>

      {/* Row 1: Shipment trend + Risk distribution */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ChartCard title="Shipment Outcomes" sub="Monthly on-time vs delayed vs exceptions">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={SHIPMENT_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
                <Area type="monotone" dataKey="onTime" name="On Time" stroke="#00c2b2" fill="#00c2b215" strokeWidth={1.5} />
                <Area type="monotone" dataKey="delayed" name="Delayed" stroke="#f59e0b" fill="#f59e0b15" strokeWidth={1.5} />
                <Area type="monotone" dataKey="exceptions" name="Exceptions" stroke="#ef4444" fill="#ef444415" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard title="Risk Distribution" sub="Current portfolio">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={RISK_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {RISK_DISTRIBUTION.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE.contentStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {RISK_DISTRIBUTION.map(r => (
              <div key={r.name} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                <span className="text-[10px] text-white/40">{r.name} {r.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Row 2: API Latency */}
      <ChartCard title="API Latency Percentiles" sub="24h P50 / P95 / P99 — ms">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={LATENCY_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
            <Line type="monotone" dataKey="p50" name="P50" stroke="#00c2b2" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="p95" name="P95" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="p99" name="P99" stroke="#ef4444" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 3: Agent performance + Resolution time */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Agent Task Volume" sub="Total tasks · success vs error">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={AGENT_PERFORMANCE} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="success" name="Success" fill="#00c2b2" opacity={0.8} radius={[2, 2, 0, 0]} />
              <Bar dataKey="tasks" name="Total" fill="#ffffff15" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Resolution Time" sub="Hours — AI auto vs manual">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={RESOLUTION_TIME} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
              <Area type="monotone" dataKey="auto" name="AI Auto" stroke="#00c2b2" fill="#00c2b215" strokeWidth={1.5} />
              <Area type="monotone" dataKey="manual" name="Manual" stroke="#8b5cf6" fill="#8b5cf615" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4: Carrier performance table */}
      <ChartCard title="Carrier Performance Scorecard" sub="Top 5 carriers by on-time delivery rate">
        <div className="space-y-2 mt-1">
          {CARRIER_PERFORMANCE.map(c => (
            <div key={c.name} className="flex items-center gap-3">
              <p className="text-xs text-white/60 w-36 shrink-0 truncate">{c.name}</p>
              <div className="flex-1">
                <div className="h-1.5 rounded-full bg-white/5">
                  <div className="h-1.5 rounded-full" style={{ width: `${c.onTime}%`, background: c.onTime > 93 ? '#10b981' : c.onTime > 88 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </div>
              <p className="text-xs font-bold text-white/60 w-10 text-right">{c.onTime}%</p>
              <p className="text-[10px] text-white/30 w-16 text-right">{c.incidents} incidents</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
