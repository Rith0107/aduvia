import {
  BedDouble,
  BookOpen,
  BriefcaseBusiness,
  Droplet,
  Flower2,
  Footprints,
  Lightbulb,
  Music2,
  WalletCards,
} from "lucide-react";

type ActivityIconProps = { activity: string; className?: string };

export function ActivityIcon({ activity, className = "size-6" }: ActivityIconProps) {
  const value = activity.toLowerCase();
  const Icon = value.includes("walk") || value.includes("fitness") || value.includes("run")
    ? Footprints
    : value.includes("read") || value.includes("learning") || value.includes("book")
      ? BookOpen
      : value.includes("meditat") || value.includes("mind") || value.includes("yoga")
        ? Flower2
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
