import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function OfflinePage() {
  return <main className="public-canvas grid min-h-screen place-items-center px-5 text-[var(--soft-ink)]"><section className="public-surface w-full max-w-xl rounded-[38px] p-8 text-center sm:p-12"><div className="flex justify-center"><BrandLogo href="/" /></div><p className="mt-10 text-[10px] font-black uppercase tracking-[.22em] text-[var(--soft-accent)]">A quiet pause</p><h1 className="mt-4 text-5xl font-semibold tracking-[-.06em]">You’re offline.</h1><p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[var(--soft-muted)]">Reconnect to sync your habits and check-ins. Changes already saved on this device will wait safely and retry when you return.</p><Link className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[var(--soft-ink)] px-6 text-sm font-bold text-white" href="/today">Try again</Link></section></main>;
}
