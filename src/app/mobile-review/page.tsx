import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mobile review", robots: { index: false, follow: false } };

const REVIEW_SCREENS: Record<string, { label: string; path: string }> = {
  today: { label: "Today", path: "/today" },
  habits: { label: "Habits", path: "/habits" },
  quests: { label: "Quests", path: "/quests" },
  insights: { label: "Insights", path: "/insights" },
  "check-in": { label: "Evening check-in", path: "/check-in" },
};

export default async function MobileReviewPage({ searchParams }: { searchParams: Promise<{ screen?: string }> }) {
  const { screen = "today" } = await searchParams;
  const selected = REVIEW_SCREENS[screen] ?? REVIEW_SCREENS.today;
  return <main className="min-h-screen bg-[#16221e] px-4 py-6 text-white sm:px-8"><div className="mx-auto flex max-w-[1180px] flex-col items-center"><div className="mb-4 flex w-full max-w-[390px] items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dfa145]">Mobile review</p><h1 className="mt-1 text-lg font-semibold">{selected.label}</h1></div><p className="text-right text-[10px] uppercase tracking-[0.14em] text-white/50">390 × 844</p></div><div className="h-[844px] w-[390px] max-w-full overflow-hidden rounded-[34px] border-[7px] border-[#26352f] bg-white shadow-[0_32px_90px_rgba(0,0,0,.4)]"><iframe className="h-full w-full bg-white" src={selected.path} title={`${selected.label} mobile preview`} /></div></div></main>;
}
