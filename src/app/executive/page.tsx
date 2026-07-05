"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { ExecutiveCharts } from "@/components/executive/executive-charts";
import { ExecutiveBriefingPanel } from "@/components/features/executive-briefing-panel";
import { AnimatedKPI } from "@/components/shared/animated-kpi";
import { demoData } from "@/lib/data";
import {
  DollarSign, Package, ShieldCheck, ShieldAlert, PiggyBank, TrendingDown,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

export default function ExecutivePage() {
  const stats = demoData.executiveStats;

  const fetchBriefing = async () => {
    const res = await fetch("/api/executive-briefing");
    return res.json();
  };

  return (
    <PageWrapper
      title="Executive Dashboard"
      subtitle="Portfolio-level KPIs, risk trends, and AI-generated briefings — every metric below is produced or protected by the agent workforce."
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title="Cargo Protected" value={`$${(stats.cargoProtected / 1e9).toFixed(1)}B`} icon={DollarSign} trend="+12% YoY" />
        <StatCard title="Active Shipments" value={stats.activeShipments.toLocaleString()} icon={Package} />
        <StatCard title="Risks Prevented" value={String(stats.risksPrevented)} icon={ShieldCheck} variant="success" trend="MTD" />
        <StatCard title="Fraud Cases Stopped" value={String(stats.fraudCasesStopped)} icon={ShieldAlert} variant="warning" />
        <StatCard title="Insurance Savings" value={`$${(stats.insuranceSavings / 1e6).toFixed(1)}M`} icon={PiggyBank} variant="success" />
        <StatCard title="Risk Reduction" value={`${stats.riskReduction}%`} icon={TrendingDown} variant="success" trend="vs last quarter" />
      </div>

      <section className="mb-12 border border-[var(--mil-border)] rounded-lg p-8 bg-[var(--mil-surface)]">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatedKPI value={stats.cargoProtected} label="Cargo Protected" format="currency" />
          <AnimatedKPI value={stats.activeShipments} label="Active Shipments" format="number" />
          <AnimatedKPI value={stats.riskReduction} label="Risk Reduction" format="percent" suffix="%" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-6">Analytics</h2>
        <ExecutiveCharts data={demoData.monthlyTrends} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Executive AI Briefing</h2>
        <ExecutiveBriefingPanel onGenerate={fetchBriefing} />
      </section>
    </PageWrapper>
  );
}
