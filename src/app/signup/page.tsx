import type { Metadata } from "next";
import { AuthScreen } from "@/features/auth/auth-screen";

export const metadata: Metadata = { title: "Sign up · Aduvia" };

export default function SignupPage() {
  return <AuthScreen mode="signup" />;
}
