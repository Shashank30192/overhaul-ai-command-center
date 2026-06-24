"use client";

import { motion } from "framer-motion";
import type { FraudCase, FraudType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { FileWarning, ShieldAlert, FileX, Receipt, Umbrella } from "lucide-react";

const FRAUD_ICONS: Record<FraudType, typeof FileWarning> = {
  double_brokering: ShieldAlert,
  carrier_identity_fraud: FileWarning,
  fake_pod: FileX,
  invoice_fraud: Receipt,
  insurance_fraud: Umbrella,
};

const FRAUD_LABELS: Record<FraudType, string> = {
  double_brokering: "Double Brokering",
  carrier_identity_fraud: "Carrier Identity Fraud",
  fake_pod: "Fake POD Documents",
  invoice_fraud: "Invoice Fraud",
  insurance_fraud: "Insurance Fraud",
};

interface FraudCaseCardProps {
  fraudCase: FraudCase;
  index?: number;
}

export function FraudCaseCard({ fraudCase, index = 0 }: FraudCaseCardProps) {
  const Icon = FRAUD_ICONS[fraudCase.type];
  const scoreVariant = fraudCase.fraudScore > 80 ? "danger" : fraudCase.fraudScore > 60 ? "warning" : "info";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Icon className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base">{FRAUD_LABELS[fraudCase.type]}</CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5 font-mono">{fraudCase.id} · {fraudCase.shipmentId}</p>
              </div>
            </div>
            <Badge variant={scoreVariant}>{fraudCase.fraudScore}% Fraud Score</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-zinc-500 text-xs">Carrier</p>
              <p className="text-white">{fraudCase.carrierName}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Financial Exposure</p>
              <p className="text-red-400 font-medium">{formatCurrency(fraudCase.financialExposure)}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Status</p>
              <Badge variant={fraudCase.status === "confirmed" ? "danger" : "warning"}>
                {fraudCase.status}
              </Badge>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Detected</p>
              <p className="text-white text-xs">{new Date(fraudCase.detectedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Evidence</p>
            <ul className="space-y-1">
              {fraudCase.evidence.map((e) => (
                <li key={e} className="text-xs text-zinc-300 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">▸</span>{e}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Recommended Actions</p>
            <div className="flex flex-wrap gap-1.5">
              {fraudCase.recommendedActions.map((a) => (
                <Badge key={a} variant="success" className="text-[10px]">{a}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { FRAUD_LABELS };
