"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain, Shield, Eye, Map, BarChart3, Thermometer, Route, FileText, ArrowRight,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { InvestigationWorkflow } from "@/components/investigation/investigation-workflow";
import { demoData, generateIncidentReport } from "@/lib/data";

const MODULES = [
  { icon: Brain, title: "AI Supply Chain Copilot", desc: "ChatGPT-like interface for natural language supply chain queries", href: "/copilot", color: "text-emerald-400" },
  { icon: Shield, title: "Predictive Theft Engine", desc: "Live risk scoring with automated security recommendations", href: "/risk", color: "text-red-400" },
  { icon: Eye, title: "AI Fraud Detection", desc: "Detect double brokering, fake PODs, invoice and insurance fraud", href: "/fraud", color: "text-amber-400" },
  { icon: Map, title: "Digital Twin Command Center", desc: "3D-style logistics network with real-time cargo movement", href: "/digital-twin", color: "text-blue-400" },
  { icon: BarChart3, title: "Executive Dashboard", desc: "C-suite KPIs, trends, and portfolio-level risk analytics", href: "/executive", color: "text-purple-400" },
  { icon: Thermometer, title: "Cold Chain Monitoring", desc: "Predict temperature excursions before they occur", href: "/risk", color: "text-cyan-400" },
  { icon: Route, title: "AI Route Optimizer", desc: "Safer, cheaper, and faster route recommendations", href: "/risk", color: "text-green-400" },
  { icon: FileText, title: "AI Incident Investigation", desc: "Automated root cause analysis and report generation", href: "#investigation", color: "text-pink-400" },
];

export default function PlatformPage() {
  const report = generateIncidentReport(demoData.shipments[0]);

  return (
    <PageWrapper
      title="Platform Overview"
      subtitle="A unified AI command center for supply chain risk intelligence, cargo protection, and fraud prevention."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {MODULES.map((mod, i) => (
          <motion.div
            key={mod.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={mod.href}>
              <Card className="h-full hover:border-blue-500/30 transition-all group cursor-pointer">
                <CardContent className="p-5">
                  <mod.icon className={`h-7 w-7 ${mod.color} mb-3 group-hover:scale-110 transition-transform`} />
                  <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
                  <p className="mt-2 text-xs text-[var(--mil-muted)] leading-relaxed">{mod.desc}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <section id="investigation" className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-2">AI Incident Investigation</h2>
        <p className="text-[var(--mil-muted)] mb-8">Automated workflow from alert to incident report</p>
        <InvestigationWorkflow report={report} />
      </section>

      <section className="glass rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Ready to see it in action?</h2>
        <p className="mt-2 text-[var(--mil-muted)]">Schedule a personalized demo with our solutions team</p>
        <Link href="/contact" className="inline-block mt-6">
          <motion.span
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--mil-blue)] text-white font-medium"
            whileHover={{ scale: 1.02 }}
          >
            Request Demo <ArrowRight className="h-4 w-4" />
          </motion.span>
        </Link>
      </section>
    </PageWrapper>
  );
}
