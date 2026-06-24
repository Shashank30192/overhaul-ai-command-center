"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "warning" | "danger";
  delay?: number;
}

const iconColors = {
  default: "text-blue-400 bg-blue-500/20",
  success: "text-emerald-400 bg-emerald-500/20",
  warning: "text-amber-400 bg-amber-500/20",
  danger: "text-red-400 bg-red-500/20",
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="hover:border-blue-500/20 transition-colors group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[var(--mil-muted)] uppercase tracking-wider">{title}</p>
              <p className="mt-2 text-2xl font-bold text-white">{value}</p>
              {subtitle && <p className="mt-1 text-xs text-[var(--mil-muted)]">{subtitle}</p>}
              {trend && <p className="mt-2 text-xs text-blue-400">{trend}</p>}
            </div>
            <div className={cn("p-2.5 rounded-lg", iconColors[variant])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
