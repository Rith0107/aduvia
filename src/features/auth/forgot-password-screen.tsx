"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSending(true);
    try {
      const { error } = await createBrowserSupabaseClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      setMessage("Check your inbox for a secure password reset link.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not send the reset link. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return <main className="auth-canvas public-canvas grid min-h-screen place-items-center p-4 text-[var(--soft-ink)]">
    <section className="public-surface relative w-full max-w-[600px] overflow-hidden rounded-[36px] p-8 shadow-[0_28px_80px_rgba(31,79,64,.16)] sm:p-12">
      <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full border-[42px] border-[var(--chart-primary)]/10" />
      <div className="relative"><BrandLogo href="/" />
        <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--soft-accent)]">A gentle return</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em]">Reset your password.</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-[var(--soft-muted)]">Enter the email connected to your Aduvia account. We’ll send you a secure link to choose a new password.</p>
        <form className="mt-9" onSubmit={submit}>
          <label className="block"><span className="text-xs font-semibold">Email address</span><div className="mt-2 flex items-center rounded-[18px] border border-black/10 bg-[var(--soft-tint-a)]/65 px-4 py-3.5 focus-within:border-[var(--soft-icon-green)]/45"><Mail className="mr-3 text-[var(--soft-icon-green)]" size={18} /><input autoComplete="email" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--soft-muted)]/55" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></div></label>
          {message && <p className="mt-5 rounded-2xl bg-[var(--soft-tint-b)] px-4 py-3 text-sm text-[var(--soft-icon-clay)]" role="status">{message}</p>}
          <button className="group mt-6 flex w-full items-center justify-between rounded-full bg-[var(--soft-ink)] py-2 pl-6 pr-2 text-sm font-semibold text-white disabled:opacity-55" disabled={sending || sent} type="submit"><span>{sending ? "Sending…" : sent ? "Reset link sent" : "Send reset link"}</span><span className="grid size-11 place-items-center rounded-full bg-[var(--chart-primary)] text-[var(--soft-ink)]"><ArrowRight size={18} /></span></button>
        </form>
        <Link className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--soft-icon-green)]" href="/login"><ArrowLeft size={15} />Back to login</Link>
      </div>
    </section>
  </main>;
}
