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
      className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8", className)}
    >
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>}
          {subtitle && <p className="mt-2 text-[var(--mil-muted)] text-lg">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
