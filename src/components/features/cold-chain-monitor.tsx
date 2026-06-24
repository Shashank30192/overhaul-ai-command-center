"use client";

import { motion } from "framer-motion";
import { Thermometer, AlertTriangle } from "lucide-react";
import type { ColdChainIncident } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ColdChainMonitor({ incidents }: { incidents: ColdChainIncident[] }) {
  return (
    <div className="space-y-3">
      {incidents.slice(0, 6).map((inc, i) => (
        <motion.div key={inc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className={inc.predictedExcursion ? "border-amber-500/30" : ""}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${inc.predictedExcursion ? "bg-amber-500/20" : "bg-blue-500/20"}`}>
                  {inc.predictedExcursion ? (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Thermometer className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-mono text-white">{inc.shipmentId}</p>
                  <p className="text-xs text-zinc-500">{inc.cargo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{inc.currentTemp.toFixed(1)}°C</p>
                <p className="text-xs text-zinc-500">Threshold: {inc.threshold}°C</p>
              </div>
              <Badge variant={inc.predictedExcursion ? "warning" : "success"}>
                {inc.probability}% excursion risk
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
