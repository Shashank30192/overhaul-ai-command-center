"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function PageWrapper({ children, className, title, subtitle }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5", className)}
    >
      {(title || subtitle) && (
        <div className="mb-5 flex items-center gap-3 border-b border-[var(--mil-border)] pb-4">
          {title && <h1 className="text-sm font-semibold text-white tracking-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-[var(--mil-muted)] border-l border-[var(--mil-border)] pl-3">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
