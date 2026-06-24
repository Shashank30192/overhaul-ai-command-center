"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, MapPin } from "lucide-react";
import type { Shipment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface RiskCardProps {
  shipment: Shipment;
  index?: number;
}

export function RiskCard({ shipment, index = 0 }: RiskCardProps) {
  const [liveRisk, setLiveRisk] = useState(shipment.riskScore);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRisk((prev) => {
        const delta = (Math.random() - 0.5) * 4;
        return Math.max(5, Math.min(99, Math.round(prev + delta)));
      });
    }, 3000 + index * 500);
    return () => clearInterval(interval);
  }, [index]);

  const riskVariant = liveRisk > 80 ? "danger" : liveRisk > 60 ? "warning" : "success";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
    >
      <Card className={`border-l-4 ${
        liveRisk > 80 ? "border-l-red-500" : liveRisk > 60 ? "border-l-amber-500" : "border-l-emerald-500"
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-mono">{shipment.id}</CardTitle>
            <Badge variant={riskVariant}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={liveRisk}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  {liveRisk}% Risk
                </motion.span>
              </AnimatePresence>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-zinc-500 text-xs">Cargo</p>
              <p className="text-white font-medium">{shipment.cargo}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Value</p>
              <p className="text-emerald-400 font-medium">{formatCurrency(shipment.cargoValue)}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Theft Probability</p>
              <p className="text-red-400 font-bold">{shipment.theftProbability}%</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Carrier</p>
              <p className="text-white truncate">{shipment.carrierName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <MapPin className="h-3 w-3" />
            {shipment.origin} → {shipment.destination}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Risk Factors
            </p>
            <ul className="text-xs text-zinc-300 space-y-0.5">
              {shipment.riskReasons.slice(0, 4).map((r) => (
                <li key={r} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-red-400 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-300">{shipment.recommendedAction}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
