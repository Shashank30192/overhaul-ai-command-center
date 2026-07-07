"use client";

import { useState } from "react";
import { CTShell, type CTView } from "@/components/control-tower/ct-shell";
import { CTDashboard } from "@/components/control-tower/ct-dashboard";
import { CTAICommand } from "@/components/control-tower/ct-ai-command";
import { CTApiMonitor } from "@/components/control-tower/ct-api-monitor";
import { CTIntegrations } from "@/components/control-tower/ct-integrations";
import { CTAnalytics } from "@/components/control-tower/ct-analytics";
import { CTEcosystemStudio } from "@/components/control-tower/ct-ecosystem-studio";
import { CTWorkflowOrchestrator } from "@/components/control-tower/ct-workflow-orchestrator";
import { CTShipmentDetail } from "@/components/control-tower/ct-shipment-detail";
import { type Shipment } from "@/components/control-tower/mock-data";

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full text-white/20 text-sm">{title} — coming soon</div>
  );
}

export default function ControlTowerPage() {
  const [view, setView] = useState<CTView>('dashboard');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const onToast = (msg: string) => { setToast(msg); };

  return (
    <>
      <CTShell view={view} setView={setView} toast={toast} clearToast={() => setToast(null)}>
        {view === 'dashboard' && <CTDashboard onShipmentClick={setSelectedShipment} onToast={onToast} />}
        {view === 'ai-command' && <CTAICommand onToast={onToast} />}
        {view === 'shipments' && <CTDashboard onShipmentClick={setSelectedShipment} onToast={onToast} />}
        {view === 'orders' && <Placeholder title="Orders" />}
        {view === 'integrations' && <CTIntegrations onToast={onToast} />}
        {view === 'agents' && <CTAICommand onToast={onToast} />}
        {view === 'workflow' && <CTEcosystemStudio onToast={onToast} />}
        {view === 'api-monitor' && <CTApiMonitor />}
        {view === 'analytics' && <CTAnalytics />}
        {view === 'orchestrator' && <CTWorkflowOrchestrator onToast={onToast} />}
        {view === 'settings' && <Placeholder title="Settings" />}
      </CTShell>

      {selectedShipment && (
        <CTShipmentDetail
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onToast={onToast}
        />
      )}
    </>
  );
}
