"use client";

import { motion } from "framer-motion";
import { Shield, DollarSign, Clock, MapPin } from "lucide-react";
import type { RouteOption } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const TYPE_CONFIG = {
  safer: { icon: Shield, color: "text-emerald-400", label: "Safer Route" },
  cheaper: { icon: DollarSign, color: "text-blue-400", label: "Cheaper Route" },
  faster: { icon: Clock, color: "text-amber-400", label: "Faster Route" },
};

export function RouteOptimizer({ routes }: { routes: RouteOption[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {routes.map((route, i) => {
        const config = TYPE_CONFIG[route.type];
        const Icon = config.icon;
        return (
          <motion.div key={route.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="h-full hover:border-emerald-500/30 transition-colors">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <Badge variant="success">{config.label}</Badge>
                    <p className="text-sm text-white font-medium mt-1">{route.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs">Distance</p>
                    <p className="text-white">{route.distance} mi</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Duration</p>
                    <p className="text-white">{route.duration}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Cost</p>
                    <p className="text-emerald-400">{formatCurrency(route.cost)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Risk Score</p>
                    <p className={route.riskScore > 60 ? "text-red-400" : "text-emerald-400"}>{route.riskScore}%</p>
                  </div>
                </div>
                {route.savings && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {route.savings}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
