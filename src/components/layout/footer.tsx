"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NAV_LINKS } from "@/lib/data/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--mil-border)] bg-[var(--mil-panel)] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="mb-4">
              <BrandLogo size="md" />
            </div>
            <p className="text-sm text-[var(--mil-muted)]">
              Next-generation AI-powered supply chain risk intelligence platform.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2">
              {NAV_LINKS.slice(1, 5).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--mil-muted)] hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Solutions</h4>
            <ul className="space-y-2 text-sm text-[var(--mil-muted)]">
              <li>Cargo Protection</li>
              <li>Fraud Detection</li>
              <li>Risk Intelligence</li>
              <li>Digital Twin</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-[var(--mil-muted)]">
              <li>sales@overhaul-ai.com</li>
              <li>+1 (800) 555-0199</li>
              <li>Austin, TX</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[var(--mil-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--mil-muted)]/70">© 2026 Overhaul × UCD AI Command Center. All rights reserved.</p>
          <motion.p
            className="text-xs text-blue-400/70"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ● Live — Monitoring 24,856 active shipments
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
