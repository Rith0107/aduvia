import type { Metadata } from "next";
import { ResetPasswordScreen } from "@/features/auth/reset-password-screen";

export const metadata: Metadata = { title: "Reset password · Aduvia" };

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
