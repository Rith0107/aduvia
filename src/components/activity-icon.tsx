import {
  AlarmClock,
  BedDouble,
  Bike,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  Code2,
  Dumbbell,
  BriefcaseBusiness,
  Droplet,
  Focus,
  Footprints,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  Mountain,
  Music2,
  NotebookPen,
  Palette,
  PanelsTopLeft,
  Salad,
  Target,
  Utensils,
} from "lucide-react";
import { mdiMeditation } from "@mdi/js";

type ActivityIconProps = { activity: string; className?: string };

export function ActivityIcon({ activity, className = "size-6" }: ActivityIconProps) {
  const value = activity.toLowerCase();
  if (value.includes("journal") || value.includes("write") || value.includes("diary")) {
    return <NotebookPen aria-hidden className={className} strokeWidth={2.2} />;
  }
  if (value.includes("meditat") || value.includes("mind") || value.includes("yoga")) {
    return (
      <svg aria-hidden className={className} fill="currentColor" viewBox="2 3 20 18">
        <path d={mdiMeditation} />
      </svg>
    );
  }
  const Icon = value.includes("deep work") || value.includes("focus")
    ? Focus
    : value.includes("calendar") || value.includes("schedule")
      ? CalendarDays
    : value.includes("portfolio") || value.includes("homepage") || value.includes("website")
      ? PanelsTopLeft
      : value.includes("react") || value.includes("code") || value.includes("program")
        ? Code2
        : value.includes("course") || value.includes("study")
          ? GraduationCap
          : value.includes("hike") || value.includes("trail")
            ? Mountain
            : value.includes("read") || value.includes("book")
              ? BookOpen
              : value.includes("budget") || value.includes("finance") || value.includes("money")
                ? CircleDollarSign
                : value.includes("run") || value.includes("walk")
                  ? Footprints
                  : value.includes("cycle") || value.includes("bike")
                    ? Bike
                    : value.includes("gym") || value.includes("strength") || value.includes("weight")
                      ? Dumbbell
                      : value.includes("water") || value.includes("drink") || value.includes("hydrate")
                        ? Droplet
                        : value.includes("sleep") || value.includes("bed")
                          ? BedDouble
                          : value.includes("wake") || value.includes("alarm")
                            ? AlarmClock
                            : value.includes("music") || value.includes("instrument")
                              ? Music2
                              : value.includes("cook") || value.includes("meal")
                                ? Utensils
                                : value.includes("diet") || value.includes("nutrition")
                                  ? Salad
                                  : value.includes("creative") || value.includes("art")
                                    ? Palette
                                    : value.includes("health")
                                      ? HeartPulse
                                      : value.includes("goal")
                                        ? Target
                                        : value.includes("work") || value.includes("career") || value.includes("project")
                                          ? BriefcaseBusiness
                                          : value.includes("fitness")
                                            ? Dumbbell
                                            : value.includes("learning")
                                              ? GraduationCap
                                              : Lightbulb;

  return <Icon aria-hidden className={className} strokeWidth={2.2} />;
}
