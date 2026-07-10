"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FraudWatchAIOnboarding } from "@/components/fraud/fraudwatch-ai-onboarding";

function FraudWatchOnboardingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const carrier = params.get("carrier") ?? undefined;

  return (
    <FraudWatchAIOnboarding
      key={carrier ?? "none"}
      prefilledCarrier={carrier}
      onClose={() => router.push("/fraud-watch")}
    />
  );
}

export default function FraudWatchOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <FraudWatchOnboardingInner />
    </Suspense>
  );
}
