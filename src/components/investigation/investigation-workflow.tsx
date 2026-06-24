"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle, MapPin, User, FileText, Brain, FileCheck, ChevronDown,
} from "lucide-react";
import type { IncidentReport } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WORKFLOW_STEPS = [
  { id: "alert", label: "Alert Triggered", icon: AlertCircle },
  { id: "gps", label: "AI analyzes GPS history", icon: MapPin },
  { id: "driver", label: "AI analyzes driver behavior", icon: User },
  { id: "docs", label: "AI analyzes shipment documents", icon: FileText },
  { id: "root", label: "AI determines root cause", icon: Brain },
  { id: "report", label: "AI generates incident report", icon: FileCheck },
];

interface InvestigationWorkflowProps {
  report: IncidentReport;
  shipmentId?: string;
  onRun?: () => void;
}

export function InvestigationWorkflow({ report, shipmentId, onRun }: InvestigationWorkflowProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [liveReport, setLiveReport] = useState<IncidentReport>(report);

  const runInvestigation = async () => {
    setRunning(true);
    setShowReport(false);
    setActiveStep(-1);
    setLiveReport(report);
    onRun?.();

    // Kick off the real AI investigation in parallel with the step animation.
    const reportPromise = fetch("/api/incident-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentId: shipmentId ?? report.shipmentId }),
    })
      .then((r) => r.json())
      .catch(() => report);

    for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      setActiveStep(i);
    }

    const result = await reportPromise;
    setLiveReport({ ...report, ...result });
    await new Promise((r) => setTimeout(r, 300));
    setShowReport(true);
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button onClick={runInvestigation} disabled={running} size="lg">
          {running ? "AI Investigating..." : "Run AI Investigation"}
        </Button>
      </div>

      <div className="relative">
        {WORKFLOW_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;

          return (
            <div key={step.id} className="flex items-start gap-4 mb-4">
              <div className="flex flex-col items-center">
                <motion.div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-[var(--mil-border)] bg-[var(--mil-elevated)] text-[var(--mil-muted)]"
                  }`}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 0.5 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className={`w-0.5 h-8 ${isActive ? "bg-blue-500/50" : "bg-[var(--mil-border)]"}`} />
                )}
              </div>
              <div className="pt-2">
                <p className={`text-sm font-medium ${isActive ? "text-white" : "text-[var(--mil-muted)]"}`}>
                  {step.label}
                </p>
                {isCurrent && running && (
                  <motion.p
                    className="text-xs text-blue-400 mt-1"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Processing...
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showReport && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-400" />
                AI Incident Report — {liveReport.id}
              </CardTitle>
              <p className="text-sm text-zinc-400">Shipment {liveReport.shipmentId} · {liveReport.alertType}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md bg-[var(--mil-elevated)] border border-[var(--mil-border)]">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Root Cause</h4>
                <p className="text-sm text-zinc-300">{liveReport.rootCause}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-md bg-[var(--mil-elevated)]">
                  <h4 className="text-xs text-[var(--mil-muted)] mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> GPS Analysis</h4>
                  <p className="text-xs text-zinc-300">{liveReport.gpsAnalysis}</p>
                </div>
                <div className="p-3 rounded-md bg-[var(--mil-elevated)]">
                  <h4 className="text-xs text-[var(--mil-muted)] mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Driver Analysis</h4>
                  <p className="text-xs text-zinc-300">{liveReport.driverAnalysis}</p>
                </div>
                <div className="p-3 rounded-md bg-[var(--mil-elevated)]">
                  <h4 className="text-xs text-[var(--mil-muted)] mb-1 flex items-center gap-1"><FileText className="h-3 w-3" /> Document Analysis</h4>
                  <p className="text-xs text-zinc-300">{liveReport.documentAnalysis}</p>
                </div>
              </div>
              <div className="p-4 rounded-md bg-blue-500/10 border border-blue-500/20">
                <h4 className="text-sm font-semibold text-white mb-2">Executive Summary</h4>
                <p className="text-sm text-zinc-300">{liveReport.summary}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {liveReport.recommendations.map((r) => (
                    <li key={r} className="text-sm text-zinc-300 flex items-start gap-2">
                      <ChevronDown className="h-4 w-4 text-blue-400 rotate-[-90deg] shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
