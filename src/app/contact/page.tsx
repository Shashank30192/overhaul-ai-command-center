"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <PageWrapper
      title="Contact Sales"
      subtitle="Schedule a personalized demo of the Overhaul AI Command Center platform."
    >
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Get in Touch</h2>
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "sales@overhaul-ai.com" },
              { icon: Phone, label: "Phone", value: "+1 (800) 555-0199" },
              { icon: MapPin, label: "HQ", value: "Austin, TX — Global Operations" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/20">
                  <item.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{item.label}</p>
                  <p className="text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">What to expect</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> 30-minute personalized platform walkthrough</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> Live demo with your industry use cases</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> ROI analysis and implementation roadmap</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> No commitment required</li>
            </ul>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white">Demo Request Received</h3>
                <p className="mt-2 text-zinc-400">Our solutions team will contact you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">First Name</label>
                    <Input required placeholder="John" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Last Name</label>
                    <Input required placeholder="Smith" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Work Email</label>
                  <Input required type="email" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Company</label>
                  <Input required placeholder="Acme Logistics" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Job Title</label>
                  <Input placeholder="VP Supply Chain" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Message</label>
                  <Textarea placeholder="Tell us about your supply chain challenges..." rows={4} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : <><Send className="h-4 w-4" /> Request Demo</>}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
