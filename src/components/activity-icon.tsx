import {
  BedDouble,
  BookOpen,
  BriefcaseBusiness,
  Droplet,
  Footprints,
  Lightbulb,
  Music2,
  WalletCards,
} from "lucide-react";

type ActivityIconProps = { activity: string; className?: string };

export function ActivityIcon({ activity, className = "size-6" }: ActivityIconProps) {
  const value = activity.toLowerCase();
  if (value.includes("meditat") || value.includes("mind") || value.includes("yoga")) {
    return (
      <svg aria-hidden className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="4.5" r="2" />
        <path d="M12 7v6M7.5 10.5 12 13l4.5-2.5M5 19c2-3.5 4.3-5.2 7-5.2s5 1.7 7 5.2M7 19l5-5.2 5 5.2M5 19h14" />
      </svg>
    );
  }
  const Icon = value.includes("walk") || value.includes("fitness") || value.includes("run")
    ? Footprints
    : value.includes("read") || value.includes("learning") || value.includes("book")
      ? BookOpen
      : value.includes("work") || value.includes("career") || value.includes("portfolio") || value.includes("project")
          ? BriefcaseBusiness
          : value.includes("water") || value.includes("drink") || value.includes("hydrate")
            ? Droplet
            : value.includes("sleep") || value.includes("bed")
              ? BedDouble
              : value.includes("music") || value.includes("practice")
                ? Music2
                : value.includes("budget") || value.includes("finance") || value.includes("money")
                  ? WalletCards
                  : Lightbulb;

  return <Icon aria-hidden className={className} strokeWidth={2} />;
}
