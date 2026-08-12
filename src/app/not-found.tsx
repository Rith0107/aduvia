import Link from "next/link";

export default function NotFound() {
  return <main className="public-canvas grid min-h-screen place-items-center px-5 text-[var(--soft-ink)]"><section className="public-surface w-full max-w-xl rounded-[38px] p-8 text-center sm:p-12"><p className="text-[10px] font-black uppercase tracking-[.22em] text-[var(--soft-accent)]">404 · Off the path</p><h1 className="mt-4 text-5xl font-semibold tracking-[-.06em]">Nothing lives here yet.</h1><p className="mt-5 text-sm leading-7 text-[var(--soft-muted)]">Return to Aduvia and continue where you left off.</p><Link className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[var(--soft-ink)] px-6 text-sm font-bold text-white" href="/">Return home</Link></section></main>;
}
