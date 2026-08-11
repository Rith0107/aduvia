"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";

type AuthMode = "login" | "signup";
type AuthNotice = "confirmation_failed" | "session_required";

const noticeMessages: Record<AuthNotice, string> = {
  confirmation_failed: "That confirmation link is invalid or has expired. Log in if you already confirmed, or create your account again to receive a fresh link.",
  session_required: "Please log in to continue. We’ll take you back to the page you requested.",
};

const commonPasswords = new Set(["password", "password123", "12345678", "qwerty123", "letmein123", "admin123"]);

function passwordStrength(password: string) {
  if (!password) return { label: "Start typing", score: 0 };
  let score = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;
  if (password.length >= 16) score += 1;
  if (/[^a-zA-Z]/.test(password)) score += 1;
  if (score >= 4) return { label: "Strong", score: 4 };
  if (score >= 3) return { label: "Good", score: 3 };
  if (score >= 2) return { label: "Growing", score: 2 };
  return { label: "Too short", score: 1 };
}

export function AuthScreen({ mode, nextPath = "/today", notice }: { mode: AuthMode; nextPath?: string; notice?: AuthNotice }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(() => notice ? noticeMessages[notice] : "");
  const [submitting, setSubmitting] = useState(false);
  const [recoverySending, setRecoverySending] = useState(false);
  const strength = passwordStrength(password);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (isSignup && name.trim().length < 2) {
      setMessage("Tell us what we should call you.");
      return;
    }
    if (isSignup && password.length < 12) {
      setMessage("Use at least 12 characters. A short phrase works well.");
      return;
    }
    if (isSignup && commonPasswords.has(password.toLowerCase())) {
      setMessage("That password is too common. Try a longer, more personal phrase.");
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setMessage("Those passwords do not match yet.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const result = isSignup
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`, data: { display_name: name.trim(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone } } })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;
      if (isSignup && !result.data.session) {
        setMessage("Check your inbox to confirm your account.");
      } else {
        router.push(isSignup ? "/onboarding" : nextPath);
      }
    } catch (error) {
      setMessage(error instanceof Error && !error.message.includes("environment variables") ? error.message : "Authentication is ready once Supabase keys are added.");
    } finally {
      setSubmitting(false);
    }
  }

  async function recoverPassword() {
    setMessage("");
    if (!email.trim()) {
      setMessage("Enter your email first, then request a reset link.");
      return;
    }
    setRecoverySending(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
      if (error) throw error;
      setMessage("Password reset link sent. Check your inbox.");
    } catch (error) {
      setMessage(error instanceof Error && !error.message.includes("environment variables") ? error.message : "Password recovery will activate once Supabase keys are added.");
    } finally {
      setRecoverySending(false);
    }
  }

  return (
    <main className="auth-canvas public-canvas min-h-screen p-3 text-[var(--soft-ink)] sm:p-5">
      <a className="skip-link" href="#auth-form">Skip to account form</a>
      <div className="public-surface mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1500px] overflow-hidden rounded-[36px] sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.04fr_.96fr]">
        <section className="relative hidden overflow-hidden bg-[var(--chart-deep)] p-12 text-white lg:flex lg:flex-col xl:p-16">
          <div className="absolute -right-28 -top-28 size-96 rounded-full border-[72px] border-[#d89a42]/12" />
          <div className="absolute -bottom-24 -left-16 size-80 rounded-full bg-[#7fa696]/12 blur-3xl" />
          <BrandLogo className="relative" inverse />

          <div className="relative my-auto max-w-xl py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e2b96c]">{isSignup ? "Your first chapter" : "Welcome back to your rhythm"}</p>
            <h1 className="mt-6 text-6xl font-semibold leading-[.94] tracking-[-0.065em] xl:text-7xl">{isSignup ? <>Small steps.<br />A life you can see.</> : <>Keep becoming,<br />one day at a time.</>}</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-white/52">{isSignup ? "You do not need perfect days. Begin with one small promise, return to it gently, and watch your month take shape." : "Your routines, side quests, and every quiet win are here—ready for the next small step."}</p>

            <div className="mt-12 grid max-w-md grid-cols-7 gap-2" aria-label="Example consistency calendar">
              {Array.from({ length: 28 }, (_, index) => <span className={`aspect-square rounded-[7px] ${isSignup && index < 7 ? "bg-white/10" : index % 8 === 0 ? "bg-[#d89a42]" : index % 5 === 0 ? "bg-[#a86550]/70" : "bg-[#8ab5a4]"}`} key={index} />)}
            </div>
            <div className="mt-5 flex items-center gap-3 text-xs text-white/42"><span className="h-px w-10 bg-white/20" />{isSignup ? "Your first month starts here" : "Your story is already in motion"}</div>
          </div>

          <p className="relative text-xs text-white/35">Private by default. Yours to reflect on and share.</p>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden bg-[linear-gradient(145deg,color-mix(in_srgb,var(--soft-surface)_88%,transparent),color-mix(in_srgb,var(--soft-tint-a)_50%,transparent))] px-6 py-10 sm:px-12 lg:px-16 xl:px-24" id="auth-form">
          <div className="pointer-events-none absolute -right-24 top-[8%] size-64 rounded-full bg-[#e8c9ba]/45 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-[7%] size-72 rounded-full bg-[#b9d5c8]/45 blur-3xl" />
          <div className="pointer-events-none absolute right-[12%] top-[19%] size-24 rounded-full border-[18px] border-[#d8a54e]/10" />
          <div className="relative w-full max-w-[470px]">
            <div className="flex items-center justify-between lg:hidden"><BrandLogo /><span className="rounded-full bg-[#dce8e1] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f6f5e]">Your quiet space</span></div>

            <Link className="mt-8 flex w-fit items-center gap-2 text-[11px] font-semibold text-[#607168] transition hover:text-[#2f6f5e] lg:mt-10" href="/"><ArrowLeft size={14} />Back to Aduvia</Link>

            <p className="mt-8 inline-flex rounded-full bg-[#f0ddd4] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a5c48] lg:mt-9">{isSignup ? "Begin your rhythm" : "Welcome back"}</p>
            <h2 className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{isSignup ? "Create your space." : "Continue your story."}</h2>
            <p className="mt-4 text-sm leading-6 text-stone-500">{isSignup ? "A private home for your routines, monthly quests, and progress." : "Your routines and quests are waiting exactly where you left them."}</p>

            <form className={isSignup ? "mt-8 space-y-4" : "mt-10 space-y-5"} onSubmit={submit}>
              {isSignup && <label className="block"><span className="text-xs font-semibold text-[#46534c]">Your name</span><div className="mt-2 flex items-center rounded-[18px] border border-[#6b9b86]/16 bg-[#dfece5]/72 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.65)] transition focus-within:border-[#2f6f5e]/45 focus-within:bg-[#e8f2ed]"><span className="mr-3 grid size-8 place-items-center rounded-full bg-[#2f6f5e] text-xs font-bold text-white">Aa</span><input autoComplete="name" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#789086]/55" onChange={(event) => setName(event.target.value)} placeholder="How should we greet you?" required value={name} /></div></label>}

              <label className="block"><span className="text-xs font-semibold text-[#46534c]">Email address</span><div className="mt-2 flex items-center rounded-[18px] border border-[#6b9b86]/16 bg-[#dfece5]/72 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.65)] transition focus-within:border-[#2f6f5e]/45 focus-within:bg-[#e8f2ed]"><span className="mr-3 grid size-8 place-items-center rounded-full bg-[#2f6f5e] text-white"><Mail size={16} strokeWidth={1.9} /></span><input autoComplete="email" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#789086]/55" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></div></label>

              <div className="block"><span className="flex items-center justify-between text-xs font-semibold text-[#46534c]"><label htmlFor="auth-password">Password</label>{isSignup ? <span className="font-medium text-[#2f6f5e]">12+ characters</span> : <button className="font-medium text-[#2f6f5e] hover:underline disabled:opacity-50" disabled={recoverySending} onClick={recoverPassword} type="button">{recoverySending ? "Sending…" : "Forgot password?"}</button>}</span><div className="mt-2 flex items-center rounded-[18px] border border-[#6b9b86]/16 bg-[#dfece5]/72 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.65)] transition focus-within:border-[#2f6f5e]/45 focus-within:bg-[#e8f2ed]"><span className="mr-3 grid size-8 place-items-center rounded-full bg-[#2f6f5e] text-white"><LockKeyhole size={16} strokeWidth={1.9} /></span><input autoComplete={isSignup ? "new-password" : "current-password"} className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#789086]/55" id="auth-password" minLength={isSignup ? 12 : 1} onChange={(event) => setPassword(event.target.value)} placeholder={isSignup ? "Try a memorable phrase" : "Enter your password"} required type={showPassword ? "text" : "password"} value={password} /><button aria-label={showPassword ? "Hide password" : "Show password"} className="ml-3 text-[#2f6f5e]/65 hover:text-[#1f4f40]" onClick={() => setShowPassword((current) => !current)} type="button">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>

              {isSignup && <div aria-label={`Password strength: ${strength.label}`} className="flex items-center gap-3"><div className="grid flex-1 grid-cols-4 gap-1.5">{Array.from({ length: 4 }, (_, index) => <span className={`h-1.5 rounded-full transition-colors ${index < strength.score ? strength.score >= 4 ? "bg-[#2f6f5e]" : "bg-[#d89a42]" : "bg-[#24302a]/10"}`} key={index} />)}</div><span className="w-16 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f7e76]">{strength.label}</span></div>}

              {isSignup && <label className="block"><span className="flex items-center justify-between text-xs font-semibold text-[#46534c]"><span>Confirm password</span>{confirmPassword && <span className={`font-medium ${password === confirmPassword ? "text-[#2f6f5e]" : "text-[#a35f49]"}`}>{password === confirmPassword ? "Passwords match" : "Passwords don’t match"}</span>}</span><div className={`mt-2 flex items-center rounded-[18px] border bg-[#dfece5]/72 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.65)] transition focus-within:bg-[#e8f2ed] ${confirmPassword && password !== confirmPassword ? "border-[#a35f49]/45" : "border-[#6b9b86]/16 focus-within:border-[#2f6f5e]/45"}`}><span className="mr-3 grid size-8 place-items-center rounded-full bg-[#2f6f5e] text-white"><LockKeyhole size={16} strokeWidth={1.9} /></span><input aria-describedby="password-match-status" autoComplete="new-password" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#789086]/55" minLength={12} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" required type={showConfirmPassword ? "text" : "password"} value={confirmPassword} /><button aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"} className="ml-3 text-[#2f6f5e]/65 hover:text-[#1f4f40]" onClick={() => setShowConfirmPassword((current) => !current)} type="button">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><span className="sr-only" id="password-match-status">{confirmPassword ? password === confirmPassword ? "Passwords match" : "Passwords do not match" : ""}</span></label>}

              {isSignup && <div className="flex items-center gap-2 text-xs text-stone-400"><span className="grid size-5 place-items-center rounded-full bg-[#dce8e1] text-[#2f6f5e]"><Check size={12} strokeWidth={2.5} /></span>Your private notes never appear in shared reports.</div>}

              {message && <p className="rounded-2xl bg-[#eee5d9] px-4 py-3 text-sm text-[#875c49]" role="status">{message}</p>}

              <button className="group flex w-full items-center justify-between rounded-full bg-[linear-gradient(100deg,#1f4f40,#2f6f5e)] py-2 pl-6 pr-2 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(36,80,62,.24)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" disabled={submitting} type="submit"><span>{submitting ? "Please wait…" : isSignup ? "Create my account" : "Enter Aduvia"}</span><span className="grid size-11 place-items-center rounded-full bg-[#e0a13f] text-[#24302a] shadow-[inset_0_1px_0_rgba(255,255,255,.38)] transition group-hover:translate-x-0.5"><ArrowRight size={18} /></span></button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-500">{isSignup ? "Already have your space?" : "New to Aduvia?"} <Link className="font-semibold text-[#2f6f5e] hover:underline" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
