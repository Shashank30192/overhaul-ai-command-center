"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { demoData } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Activity, AlertTriangle, Package, TrendingDown } from "lucide-react";

export function DashboardPreview() {
  const [riskPulse, setRiskPulse] = useState(73);
  const topShipments = demoData.shipments.slice(0, 4);

  useEffect(() => {
    const interval = setInterval(() => {
      setRiskPulse((p) => Math.max(60, Math.min(90, p + (Math.random() - 0.5) * 5)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="overflow-hidden border-blue-500/20">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--mil-border)] bg-[var(--mil-panel)]">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-medium text-white">Live Command Dashboard</span>
        </div>
        <motion.div
          className="flex items-center gap-1.5 text-xs text-blue-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          Real-time
        </motion.div>
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-md bg-[var(--mil-elevated)] text-center">
            <Package className="h-4 w-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">24,856</p>
            <p className="text-[10px] text-[var(--mil-muted)]">Active</p>
          </div>
          <div className="p-3 rounded-md bg-[var(--mil-elevated)] text-center">
            <AlertTriangle className="h-4 w-4 text-red-400 mx-auto mb-1" />
            <motion.p className="text-lg font-bold text-red-400" key={Math.round(riskPulse)}>
              {Math.round(riskPulse)}
            </motion.p>
            <p className="text-[10px] text-[var(--mil-muted)]">Avg Risk</p>
          </div>
          <div className="p-3 rounded-md bg-[var(--mil-elevated)] text-center">
            <TrendingDown className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-emerald-400">-34%</p>
            <p className="text-[10px] text-[var(--mil-muted)]">Risk ↓</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[var(--mil-muted)] uppercase tracking-wider">High Risk Shipments</p>
          {topShipments.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-center justify-between p-2 rounded-md bg-[var(--mil-elevated)] text-xs"
            >
              <div>
                <span className="font-mono text-white">{s.id}</span>
                <span className="text-[var(--mil-muted)] ml-2">{s.cargo}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--mil-muted)]">{formatCurrency(s.cargoValue)}</span>
                <Badge variant={s.riskScore > 80 ? "danger" : "warning"}>{s.riskScore}%</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
