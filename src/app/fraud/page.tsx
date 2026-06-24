"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { FraudCaseCard, FRAUD_LABELS } from "@/components/fraud/fraud-case-card";
import { InvestigationWorkflow } from "@/components/investigation/investigation-workflow";
import { demoData, generateIncidentReport } from "@/lib/data";
import type { FraudType } from "@/lib/types";
import { StatCard } from "@/components/shared/stat-card";
import { ShieldAlert, FileWarning, FileX, Receipt, Umbrella } from "lucide-react";

const FRAUD_TYPE_ICONS: Record<FraudType, typeof ShieldAlert> = {
  double_brokering: ShieldAlert,
  carrier_identity_fraud: FileWarning,
  fake_pod: FileX,
  invoice_fraud: Receipt,
  insurance_fraud: Umbrella,
};

export default function FraudPage() {
  const report = generateIncidentReport(demoData.shipments[2]);
  const confirmed = demoData.fraudCases.filter((f) => f.status === "confirmed").length;
  const investigating = demoData.fraudCases.filter((f) => f.status === "investigating").length;
  const totalExposure = demoData.fraudCases.reduce((s, f) => s + f.financialExposure, 0);

  return (
    <PageWrapper
      title="AI Fraud Detection"
      subtitle="Detect double brokering, carrier identity fraud, fake POD documents, invoice fraud, and insurance fraud."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Cases" value={String(demoData.fraudCases.length)} icon={ShieldAlert} delay={0} />
        <StatCard title="Confirmed" value={String(confirmed)} icon={FileWarning} variant="danger" delay={0.1} />
        <StatCard title="Investigating" value={String(investigating)} icon={FileX} variant="warning" delay={0.2} />
        <StatCard title="Total Exposure" value={`$${(totalExposure / 1e6).toFixed(1)}M`} icon={Receipt} delay={0.3} />
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Fraud Types Monitored</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(Object.keys(FRAUD_LABELS) as FraudType[]).map((type) => {
            const Icon = FRAUD_TYPE_ICONS[type];
            const count = demoData.fraudCases.filter((f) => f.type === type).length;
            return (
              <div key={type} className="glass rounded-xl p-4 text-center">
                <Icon className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-white font-medium">{FRAUD_LABELS[type]}</p>
                <p className="text-lg font-bold text-amber-400 mt-1">{count}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Fraud Investigation Dashboard</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {demoData.fraudCases.slice(0, 8).map((f, i) => (
            <FraudCaseCard key={f.id} fraudCase={f} index={i} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">AI Incident Investigation</h2>
        <p className="text-sm text-zinc-400 mb-6">Automated fraud case investigation workflow</p>
        <InvestigationWorkflow report={report} />
      </section>
    </PageWrapper>
  );
}
