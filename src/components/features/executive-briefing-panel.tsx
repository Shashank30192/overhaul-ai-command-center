"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import type { ExecutiveBriefing } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ExecutiveBriefingPanelProps {
  onGenerate: () => Promise<ExecutiveBriefing>;
}

export function ExecutiveBriefingPanel({ onGenerate }: ExecutiveBriefingPanelProps) {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<ExecutiveBriefing | null>(null);

  const generate = async () => {
    setLoading(true);
    const result = await onGenerate();
    setBriefing(result);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={generate} disabled={loading} size="lg" className="w-full sm:w-auto">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        Generate Daily Executive Report
      </Button>

      {briefing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-emerald-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                Daily Executive Briefing
              </CardTitle>
              <p className="text-xs text-zinc-500">Generated {new Date(briefing.generatedAt).toLocaleString()}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-3">Top Risks</h4>
                <div className="space-y-2">
                  {briefing.topRisks.map((r) => (
                    <div key={r.title} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="text-sm text-white">{r.title}</p>
                        <p className="text-xs text-zinc-500">{r.impact}</p>
                      </div>
                      <Badge variant={r.severity === "critical" ? "danger" : "warning"}>{r.severity}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-3">Major Incidents</h4>
                <div className="space-y-2">
                  {briefing.majorIncidents.map((inc) => (
                    <div key={inc.id} className="p-3 rounded-lg bg-white/5">
                      <div className="flex justify-between">
                        <span className="text-xs font-mono text-zinc-500">{inc.id}</span>
                        <Badge variant="info">{inc.status}</Badge>
                      </div>
                      <p className="text-sm text-zinc-300 mt-1">{inc.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-emerald-400 mb-3">Recommendations</h4>
                <ul className="space-y-1">
                  {briefing.recommendations.map((r) => (
                    <li key={r} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-emerald-400">→</span>{r}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Financial Impact</h4>
                <div className="grid grid-cols-2 gap-3">
                  {briefing.financialImpact.map((f) => (
                    <div key={f.category} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs text-zinc-500">{f.category}</p>
                      <p className="text-lg font-bold text-emerald-400">{formatCurrency(f.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
