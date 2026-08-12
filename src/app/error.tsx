"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Aduvia screen error", error); }, [error]);
  return <main className="public-canvas grid min-h-screen place-items-center px-5 text-[var(--soft-ink)]"><section className="public-surface w-full max-w-xl rounded-[38px] p-8 text-center sm:p-12"><p className="text-[10px] font-black uppercase tracking-[.22em] text-[var(--soft-accent)]">Aduvia paused</p><h1 className="mt-4 text-5xl font-semibold tracking-[-.06em]">This page needs another moment.</h1><p className="mt-5 text-sm leading-7 text-[var(--soft-muted)]">Your saved progress is untouched. Try loading the page again.</p><button className="mt-8 min-h-12 rounded-full bg-[var(--soft-ink)] px-6 text-sm font-bold text-white" onClick={reset} type="button">Try again</button></section></main>;
}
