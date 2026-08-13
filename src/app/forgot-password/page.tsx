import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/features/auth/forgot-password-screen";

export const metadata: Metadata = { title: "Forgot password · Aduvia" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
