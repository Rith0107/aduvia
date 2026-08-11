import type { Metadata } from "next";
import { AuthScreen } from "@/features/auth/auth-screen";

export const metadata: Metadata = { title: "Log in · Aduvia" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const requestedNext = (await searchParams).next;
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/today";
  return <AuthScreen mode="login" nextPath={nextPath} />;
}
