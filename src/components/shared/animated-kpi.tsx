"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

interface AnimatedKPIProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  className?: string;
  format?: "currency" | "number" | "percent";
}

export function AnimatedKPI({ value, prefix = "", suffix = "", decimals = 0, label, className, format }: AnimatedKPIProps) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (v) => {
    if (format === "currency") {
      if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      return formatCurrency(value);
    }
    if (format === "percent") return `${v.toFixed(decimals)}%`;
    return formatNumber(Math.round(v));
  });
  const [text, setText] = useState("0");

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [value, spring, display]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("text-center", className)}
    >
      <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
        {prefix}{text}{format === "percent" ? "" : suffix}
      </div>
      <div className="mt-1 text-sm text-[var(--mil-muted)]">{label}</div>
    </motion.div>
  );
}
