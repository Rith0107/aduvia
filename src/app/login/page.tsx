import type { Metadata } from "next";
import { AuthScreen } from "@/features/auth/auth-screen";

export const metadata: Metadata = { title: "Log in · Aduvia" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; reason?: string }> }) {
  const params = await searchParams;
  const requestedNext = params.next;
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/today";
  const notice = params.error === "confirmation_failed" ? "confirmation_failed" : params.reason === "session_required" ? "session_required" : undefined;
  return <AuthScreen mode="login" nextPath={nextPath} notice={notice} />;
}
