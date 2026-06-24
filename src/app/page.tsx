"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ArrowRight, Play, Brain, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedKPI } from "@/components/shared/animated-kpi";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { demoData } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--mil-border)] bg-[var(--mil-surface)] mb-6">
              <BrandLogo size="sm" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Predict.{" "}
              <span className="text-blue-400">Prevent.</span>{" "}
              Protect.
            </h1>
            <p className="mt-6 text-lg text-[var(--mil-muted)] max-w-lg leading-relaxed">
              AI-powered supply chain intelligence that predicts theft, prevents fraud,
              and protects high-value cargo before incidents occur.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg">
                  Request Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/platform">
                <Button variant="secondary" size="lg">
                  <Play className="h-4 w-4" /> Watch Platform Tour
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glow-green"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-[var(--mil-border)] bg-[var(--mil-surface)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedKPI value={demoData.heroStats.cargoProtected} label="Cargo Protected" format="currency" />
            <AnimatedKPI value={demoData.heroStats.shipmentProtection} label="Shipment Protection" format="percent" decimals={1} suffix="%" />
            <AnimatedKPI value={demoData.heroStats.recoverySuccess} label="Recovery Success" format="percent" suffix="%" />
            <AnimatedKPI value={demoData.heroStats.analystTimeReduction} label="Analyst Time Reduction" format="percent" suffix="%" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Intelligence at Every Layer</h2>
            <p className="mt-3 text-[var(--mil-muted)]">From predictive theft prevention to AI-powered fraud detection</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "AI Copilot", desc: "Natural language access to your entire supply chain network", href: "/copilot" },
              { icon: Eye, title: "Risk Monitor", desc: "Real-time heatmaps and predictive risk scoring across global lanes", href: "/risk" },
              { icon: Lock, title: "Fraud Detection", desc: "Detect double brokering, fake PODs, and carrier identity fraud", href: "/fraud" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={f.href} className="block glass rounded-lg p-6 hover:border-blue-500/30 transition-all group">
                  <f.icon className="h-8 w-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-[var(--mil-muted)]">{f.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-blue-400">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
