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
    badgeBg: "bg-violet-50 dark:bg-violet-950/40",
    badgeText: "text-violet-700 dark:text-violet-300",
    badgeBorder: "border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    barColor: "bg-violet-500",
  },
  "Non-Fiction": {
    label: "Non-Fiction",
    icon: Lightbulb,
    badgeBg: "bg-sky-50 dark:bg-sky-950/40",
    badgeText: "text-sky-700 dark:text-sky-300",
    badgeBorder: "border-sky-200 dark:border-sky-800",
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    iconColor: "text-sky-600 dark:text-sky-400",
    barColor: "bg-sky-500",
  },
  "Sci-Fi": {
    label: "Sci-Fi",
    icon: Rocket,
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    badgeBorder: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    barColor: "bg-emerald-500",
  },
  Biography: {
    label: "Biography",
    icon: UserRound,
    badgeBg: "bg-rose-50 dark:bg-rose-950/40",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-200 dark:border-rose-800",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    barColor: "bg-rose-500",
  },
  Other: {
    label: "Other",
    icon: Bookmark,
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-700 dark:text-slate-300",
    badgeBorder: "border-slate-200 dark:border-slate-700",
    iconBg: "bg-slate-200 dark:bg-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    barColor: "bg-slate-500",
  },
};

export function getGenreStyle(genre: string): GenreStyle {
  return (
    GENRE_STYLES[genre] || {
      label: genre,
      icon: Bookmark,
      badgeBg: "bg-gray-100 dark:bg-gray-800",
      badgeText: "text-gray-700 dark:text-gray-300",
      badgeBorder: "border-gray-200 dark:border-gray-700",
      iconBg: "bg-gray-100 dark:bg-gray-800",
      iconColor: "text-gray-600 dark:text-gray-400",
      barColor: "bg-gray-500",
    }
  );
}

