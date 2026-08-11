"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password.length < 12) return setMessage("Use at least 12 characters. A short phrase works well.");
    if (password !== confirmPassword) return setMessage("Those passwords do not match yet.");

    setSubmitting(true);
    try {
      const { error } = await createBrowserSupabaseClient().auth.updateUser({ password });
      if (error) throw error;
      router.replace("/today");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not update your password. Request a new recovery link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-canvas public-canvas grid min-h-screen place-items-center p-4 text-[var(--soft-ink)]">
      <section className="public-surface w-full max-w-[560px] rounded-[36px] p-8 shadow-[0_28px_80px_rgba(31,79,64,.16)] sm:p-12">
        <BrandLogo />
        <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a5c48]">A fresh key</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em]">Choose a new password.</h1>
        <p className="mt-4 text-sm leading-6 text-stone-500">Use a memorable phrase with at least 12 characters.</p>
        <form className="mt-9 space-y-5" onSubmit={submit}>
          <label className="block"><span className="text-xs font-semibold text-[#46534c]">New password</span><div className="mt-2 flex items-center rounded-[18px] border border-[#6b9b86]/16 bg-[#dfece5]/72 px-4 py-3.5"><LockKeyhole className="mr-3 text-[#2f6f5e]" size={18} /><input className="min-w-0 flex-1 bg-transparent outline-none" minLength={12} onChange={(event) => setPassword(event.target.value)} required type={showPassword ? "text" : "password"} value={password} /><button aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          <label className="block"><span className="text-xs font-semibold text-[#46534c]">Confirm password</span><div className="mt-2 flex items-center rounded-[18px] border border-[#6b9b86]/16 bg-[#dfece5]/72 px-4 py-3.5"><LockKeyhole className="mr-3 text-[#2f6f5e]" size={18} /><input className="min-w-0 flex-1 bg-transparent outline-none" minLength={12} onChange={(event) => setConfirmPassword(event.target.value)} required type={showPassword ? "text" : "password"} value={confirmPassword} /></div></label>
          {message && <p className="rounded-2xl bg-[#eee5d9] px-4 py-3 text-sm text-[#875c49]" role="status">{message}</p>}
          <button className="w-full rounded-full bg-[#1f4f40] px-6 py-4 font-semibold text-white disabled:opacity-60" disabled={submitting} type="submit">{submitting ? "Updating…" : "Save new password"}</button>
        </form>
      </section>
    </main>
  );
}
