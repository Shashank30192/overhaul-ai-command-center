"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Shield, TrendingUp } from "lucide-react";
import { demoData } from "@/lib/data";

const alerts = [
  { icon: AlertTriangle, text: `HIGH RISK: Shipment ${demoData.shipments[0]?.id} — ${demoData.shipments[0]?.theftProbability}% theft probability`, type: "danger" },
  { icon: Shield, text: `FRAUD ALERT: ${demoData.fraudCases[0]?.type.replace(/_/g, " ")} detected on ${demoData.fraudCases[0]?.shipmentId}`, type: "warning" },
  { icon: TrendingUp, text: `${demoData.executiveStats.risksPrevented} risks prevented this month — ${demoData.executiveStats.riskReduction}% reduction`, type: "success" },
  { icon: AlertTriangle, text: `COLD CHAIN: Temperature excursion predicted on ${demoData.coldChainIncidents[0]?.shipmentId}`, type: "warning" },
  { icon: Shield, text: `$${(demoData.executiveStats.cargoProtected / 1e9).toFixed(1)}B cargo protected across global network`, type: "success" },
];

export function AlertTicker() {
  const items = [...alerts, ...alerts];

  return (
    <div id="alert-ticker" className="relative overflow-hidden border-b border-[var(--mil-border)] bg-[var(--mil-surface)] py-2">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -50 + "%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {items.map((alert, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <alert.icon className={`h-3.5 w-3.5 shrink-0 ${
              alert.type === "danger" ? "text-red-400" :
              alert.type === "warning" ? "text-amber-400" : "text-blue-400"
            }`} />
            <span className="text-[var(--mil-muted)]">{alert.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
