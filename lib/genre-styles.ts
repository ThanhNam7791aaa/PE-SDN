import {
  BookOpen,
  Lightbulb,
  Rocket,
  UserRound,
  Bookmark,
  LucideIcon,
} from "lucide-react";

export interface GenreStyle {
  label: string;
  icon: LucideIcon;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
  iconColor: string;
  barColor: string;
}

export const GENRE_STYLES: Record<string, GenreStyle> = {
  Fiction: {
    label: "Fiction",
    icon: BookOpen,
    badgeBg: "bg-violet-100 dark:bg-violet-950/70",
    badgeText: "text-violet-800 dark:text-violet-200",
    badgeBorder: "border-violet-300 dark:border-violet-700",
    iconBg: "bg-violet-100 dark:bg-violet-900/60",
    iconColor: "text-violet-700 dark:text-violet-300",
    barColor: "bg-violet-600 dark:bg-violet-500",
  },
  "Non-Fiction": {
    label: "Non-Fiction",
    icon: Lightbulb,
    badgeBg: "bg-sky-100 dark:bg-sky-950/70",
    badgeText: "text-sky-800 dark:text-sky-200",
    badgeBorder: "border-sky-300 dark:border-sky-700",
    iconBg: "bg-sky-100 dark:bg-sky-900/60",
    iconColor: "text-sky-700 dark:text-sky-300",
    barColor: "bg-sky-600 dark:bg-sky-500",
  },
  "Sci-Fi": {
    label: "Sci-Fi",
    icon: Rocket,
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/70",
    badgeText: "text-emerald-800 dark:text-emerald-200",
    badgeBorder: "border-emerald-300 dark:border-emerald-700",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/60",
    iconColor: "text-emerald-700 dark:text-emerald-300",
    barColor: "bg-emerald-600 dark:bg-emerald-500",
  },
  Biography: {
    label: "Biography",
    icon: UserRound,
    badgeBg: "bg-rose-100 dark:bg-rose-950/70",
    badgeText: "text-rose-800 dark:text-rose-200",
    badgeBorder: "border-rose-300 dark:border-rose-700",
    iconBg: "bg-rose-100 dark:bg-rose-900/60",
    iconColor: "text-rose-700 dark:text-rose-300",
    barColor: "bg-rose-600 dark:bg-rose-500",
  },
  Other: {
    label: "Other",
    icon: Bookmark,
    badgeBg: "bg-slate-200 dark:bg-slate-800",
    badgeText: "text-slate-800 dark:text-slate-200",
    badgeBorder: "border-slate-300 dark:border-slate-600",
    iconBg: "bg-slate-200 dark:bg-slate-700",
    iconColor: "text-slate-700 dark:text-slate-300",
    barColor: "bg-slate-600 dark:bg-slate-400",
  },
};

export function getGenreStyle(genre: string): GenreStyle {
  return (
    GENRE_STYLES[genre] || {
      label: genre,
      icon: Bookmark,
      badgeBg: "bg-gray-200 dark:bg-gray-800",
      badgeText: "text-gray-800 dark:text-gray-200",
      badgeBorder: "border-gray-300 dark:border-gray-600",
      iconBg: "bg-gray-200 dark:bg-gray-700",
      iconColor: "text-gray-700 dark:text-gray-300",
      barColor: "bg-gray-600 dark:bg-gray-400",
    }
  );
}
