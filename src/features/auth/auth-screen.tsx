"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (isSignup && name.trim().length < 2) {
      setMessage("Tell us what we should call you.");
      return;
    }
    if (password.length < 8) {
      setMessage("Use at least 8 characters for your password.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const result = isSignup
        ? await supabase.auth.signUp({ email, password, options: { data: { display_name: name.trim() } } })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;
      if (isSignup && !result.data.session) {
        setMessage("Check your inbox to confirm your account.");
      } else {
        router.push("/");
      }
    } catch (error) {
      setMessage(error instanceof Error && !error.message.includes("environment variables") ? error.message : "Authentication is ready once Supabase keys are added.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-canvas min-h-screen p-3 text-[#24302a] sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1500px] overflow-hidden rounded-[34px] border border-white/70 bg-[#f7f6f0]/82 shadow-[0_36px_100px_rgba(35,55,45,.16)] backdrop-blur-2xl sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.04fr_.96fr]">
        <section className="relative hidden overflow-hidden bg-[#153f32] p-12 text-white lg:flex lg:flex-col xl:p-16">
          <div className="absolute -right-28 -top-28 size-96 rounded-full border-[72px] border-[#d89a42]/12" />
          <div className="absolute -bottom-24 -left-16 size-80 rounded-full bg-[#7fa696]/12 blur-3xl" />
          <Link className="relative text-2xl font-black tracking-[-0.06em]" href="/">quest<span className="text-[#d89a42]">/</span>log</Link>

          <div className="relative my-auto max-w-xl py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e2b96c]">A calmer way to grow</p>
            <h1 className="mt-6 text-6xl font-semibold leading-[.94] tracking-[-0.065em] xl:text-7xl">Your days become your story.</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-white/52">Build gentle routines, finish the quests that matter, and keep a visual record of the person you are becoming.</p>

            <div className="mt-12 grid max-w-md grid-cols-7 gap-2" aria-label="Example consistency calendar">
              {Array.from({ length: 28 }, (_, index) => <span className={`aspect-square rounded-[7px] ${index % 8 === 0 ? "bg-[#d89a42]" : index % 5 === 0 ? "bg-[#a86550]/70" : "bg-[#8ab5a4]"}`} key={index} />)}
            </div>
            <div className="mt-5 flex items-center gap-3 text-xs text-white/42"><span className="h-px w-10 bg-white/20" />A month of small proof</div>
          </div>

          <p className="relative text-xs text-white/35">Private by default. Yours to reflect on and share.</p>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden bg-[linear-gradient(145deg,rgba(255,252,244,.82),rgba(232,240,235,.82))] px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
          <div className="pointer-events-none absolute -right-24 top-[8%] size-64 rounded-full bg-[#e8c9ba]/45 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-[7%] size-72 rounded-full bg-[#b9d5c8]/45 blur-3xl" />
          <div className="pointer-events-none absolute right-[12%] top-[19%] size-24 rounded-full border-[18px] border-[#d8a54e]/10" />
          <div className="relative w-full max-w-[470px]">
            <div className="flex items-center justify-between lg:hidden"><Link className="text-xl font-black tracking-[-0.06em]" href="/">quest<span className="text-[#a86f5b]">/</span>log</Link><span className="rounded-full bg-[#dce8e1] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f6f5e]">Your quiet space</span></div>

            <p className="mt-14 inline-flex rounded-full bg-[#f0ddd4] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a5c48] lg:mt-0">{isSignup ? "Begin your rhythm" : "Welcome back"}</p>
            <h2 className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{isSignup ? "Create your space." : "Continue your story."}</h2>
            <p className="mt-4 text-sm leading-6 text-stone-500">{isSignup ? "A private home for your routines, monthly quests, and progress." : "Your routines and quests are waiting exactly where you left them."}</p>

            <form className="mt-10 space-y-5" onSubmit={submit}>
              {isSignup && <label className="block"><span className="text-xs font-semibold text-[#46534c]">Your name</span><div className="mt-2 flex items-center rounded-[18px] border border-[#6b9b86]/16 bg-[#dfece5]/72 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.65)] transition focus-within:border-[#2f6f5e]/45 focus-within:bg-[#e8f2ed]"><span className="mr-3 grid size-8 place-items-center rounded-full bg-[#2f6f5e] text-xs font-bold text-white">Aa</span><input autoComplete="name" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#789086]/55" onChange={(event) => setName(event.target.value)} placeholder="How should we greet you?" required value={name} /></div></label>}

              <label className="block"><span className="text-xs font-semibold text-[#46534c]">Email address</span><div className="mt-2 flex items-center rounded-[18px] border border-[#668ba0]/16 bg-[#e0e9ee]/72 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.65)] transition focus-within:border-[#456c85]/45 focus-within:bg-[#e9f0f4]"><span className="mr-3 grid size-8 place-items-center rounded-full bg-[#456c85] text-white"><Mail size={16} strokeWidth={1.9} /></span><input autoComplete="email" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#607c8c]/55" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></div></label>

              <label className="block"><span className="flex items-center justify-between text-xs font-semibold text-[#46534c]"><span>Password</span><span className="font-medium text-[#a86f5b]">8+ characters</span></span><div className="mt-2 flex items-center rounded-[18px] border border-[#b77760]/16 bg-[#f0dfd7]/72 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.65)] transition focus-within:border-[#a35f49]/45 focus-within:bg-[#f5e8e2]"><span className="mr-3 grid size-8 place-items-center rounded-full bg-[#a35f49] text-white"><LockKeyhole size={16} strokeWidth={1.9} /></span><input autoComplete={isSignup ? "new-password" : "current-password"} className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#9a6a59]/50" minLength={8} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required type={showPassword ? "text" : "password"} value={password} /><button aria-label={showPassword ? "Hide password" : "Show password"} className="ml-3 text-[#a86f5b]/70 hover:text-[#7e4636]" onClick={() => setShowPassword((current) => !current)} type="button">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>

              {isSignup && <div className="flex items-center gap-2 text-xs text-stone-400"><span className="grid size-5 place-items-center rounded-full bg-[#dce8e1] text-[#2f6f5e]"><Check size={12} strokeWidth={2.5} /></span>Your private notes never appear in shared reports.</div>}

              {message && <p className="rounded-2xl bg-[#eee5d9] px-4 py-3 text-sm text-[#875c49]" role="status">{message}</p>}

              <button className="group flex w-full items-center justify-between rounded-full bg-[linear-gradient(100deg,#1f4f40,#2f6f5e)] py-2 pl-6 pr-2 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(36,80,62,.24)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" disabled={submitting} type="submit"><span>{submitting ? "Please wait…" : isSignup ? "Create my account" : "Enter QuestLog"}</span><span className="grid size-11 place-items-center rounded-full bg-[#e0a13f] text-[#24302a] shadow-[inset_0_1px_0_rgba(255,255,255,.38)] transition group-hover:translate-x-0.5"><ArrowRight size={18} /></span></button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-500">{isSignup ? "Already have your space?" : "New to QuestLog?"} <Link className="font-semibold text-[#2f6f5e] hover:underline" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
