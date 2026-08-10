import type { Metadata } from "next";

import { OnboardingScreen } from "@/features/onboarding/onboarding-screen";

export const metadata: Metadata = { title: "Begin your rhythm · Aduvia" };

export default function OnboardingPage() {
  return <OnboardingScreen />;
}
