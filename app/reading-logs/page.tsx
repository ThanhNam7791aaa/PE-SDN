"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useReadingLogs } from "@/context/reading-log-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getGenreStyle } from "@/lib/genre-styles";
import {
  BookOpen,
  Calendar,
  Clock,
  Heart,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

const GENRES = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"] as const;

export default function ReadingLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    readingLogs,
    summary,
    loading: logsLoading,
    genreFilter,
    favoriteFilter,
    searchQuery,
    setGenreFilter,
    setFavoriteFilter,
    setSearchQuery,
    clearFilters,
    addReadingLog,
    toggleFavorite,
    deleteReadingLog,
  } = useReadingLogs();

  // Form state
  const [bookTitle, setBookTitle] = useState("");
  const [minutesRead, setMinutesRead] = useState("");
  const [genre, setGenre] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auth protection: no content flashed while checking
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return null;
  }

  // Field validation helpers (exact spec messages)
  const getBookTitleError = (val: string) => {
    if (!val.trim()) return "Book title is required";
    if (val.trim().length > 80) return "Book title must be at most 80 characters";
    return "";
  };

  const getMinutesError = (val: string) => {
    if (!val || !val.trim()) return "Minutes read is required";
    const num = Number(val);
    if (isNaN(num)) return "Minutes read is required";
    if (num <= 0) return "Minutes read must be a positive number";
    return "";
  };

  const getGenreError = (val: string) => {
    if (!val) return "Please choose a genre";
    if (!GENRES.includes(val as any)) return "Invalid genre";
    return "";
  };

  const getDateError = (val: string) => {
    if (!val || !val.trim()) return "Date is required";
    const now = new Date();
    const utcToday = now.toISOString().split("T")[0];
    const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    if (val > localToday && val > utcToday) {
      return "Date cannot be in the future";
    }
    return "";
  };

  const bookTitleError = hasSubmitted ? getBookTitleError(bookTitle) : "";
  const minutesError = hasSubmitted ? getMinutesError(minutesRead) : "";
  const genreError = hasSubmitted ? getGenreError(genre) : "";
  const dateError = hasSubmitted ? getDateError(date) : "";

  const handleAddReadingLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setApiError("");
    setSuccessMessage("");

    const btErr = getBookTitleError(bookTitle);
    const mErr = getMinutesError(minutesRead);
    const gErr = getGenreError(genre);
    const dErr = getDateError(date);

    if (btErr || mErr || gErr || dErr) {
      return;
    }

    setIsSubmitting(true);
    const result = await addReadingLog({
      bookTitle: bookTitle.trim(),
      minutesRead: Math.floor(Number(minutesRead)),
      genre,
      note: note.trim(),
      readOn: date,
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage("Reading session added");
      setBookTitle("");
      setMinutesRead("");
      setGenre("");
      setNote("");
      setDate("");
      setHasSubmitted(false);
      // Autofocus title field after successful add
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    } else {
      setApiError(result.error || "Failed to add reading session");
    }
  };

  // Max total for progress bar scaling in breakdown
  const maxTotalMinutes =
    summary.breakdown.length > 0
      ? Math.max(...summary.breakdown.map((b) => b.total), 1)
      : 1;

  return (
    <div
      data-testid="reading-logs-page"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      {/* Responsive layout:
          On desktop (>= 1280px): 12-col grid (4 cols left sticky, 8 cols right).
          On mobile/tablet (< 1280px): single column ordered: Summary, Form, Filters, List.
      */}
      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-6 items-start">
        {/* Summary Card: order-1 on mobile, left column on desktop */}
        <div className="w-full order-1 xl:order-none xl:col-span-4 space-y-6 xl:sticky xl:top-20 self-start">
          {/* Add Reading Session Card */}
          <Card className="shadow-subtle order-2 xl:order-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Add reading session</CardTitle>
                <div className="h-8 w-8 rounded-xl bg-accent text-primary flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                data-testid="reading-log-form"
                noValidate
                onSubmit={handleAddReadingLog}
                className="space-y-4"
              >
                {apiError && (
                  <div
                    data-testid="error-reading-log"
                    className="p-3 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Book Title (Full width) */}
                <div className="space-y-1.5">
                  <Label htmlFor="bookTitle" className="text-xs font-medium">
                    Book title
                  </Label>
                  <Input
                    ref={titleInputRef}
                    id="bookTitle"
                    data-testid="input-book-title"
                    value={bookTitle}
                    onChange={(e) => {
                      setBookTitle(e.target.value);
                      setApiError("");
                      setSuccessMessage("");
                    }}
                    placeholder="e.g. Atomic Habits"
                  />
                  {bookTitleError && (
                    <div
                      data-testid="error-book-title"
                      className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{bookTitleError}</span>
                    </div>
                  )}
                </div>

                {/* 2-Column Grid on sm+: Minutes + Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Minutes Read */}
                  <div className="space-y-1.5">
                    <Label htmlFor="minutesRead" className="text-xs font-medium">
                      Minutes read
                    </Label>
                    <Input
                      id="minutesRead"
                      type="text"
                      inputMode="numeric"
                      data-testid="input-minutes"
                      value={minutesRead}
                      onChange={(e) => {
                        setMinutesRead(e.target.value);
                        setApiError("");
                        setSuccessMessage("");
                      }}
                      placeholder="e.g. 40"
                    />
                    {minutesError && (
                      <div
                        data-testid="error-minutes"
                        className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{minutesError}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs font-medium">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      data-testid="input-date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setApiError("");
                        setSuccessMessage("");
                      }}
                    />
                    {dateError && (
                      <div
                        data-testid="error-date"
                        className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{dateError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Genre (Native select) */}
                <div className="space-y-1.5">
                  <Label htmlFor="genre" className="text-xs font-medium">
                    Genre
                  </Label>
                  <select
                    id="genre"
                    data-testid="input-genre"
                    value={genre}
                    onChange={(e) => {
                      setGenre(e.target.value);
                      setApiError("");
                      setSuccessMessage("");
                    }}
                    className="flex min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 py-2 text-base sm:text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary transition-colors cursor-pointer"
                  >
                    <option value="">Choose genre</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  {genreError && (
                    <div
                      data-testid="error-genre"
                      className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{genreError}</span>
                    </div>
                  )}
                </div>

                {/* Note (optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="note" className="text-xs font-medium text-muted-foreground">
                    Note <span className="font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="note"
                    data-testid="input-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-reading-log"
                  className="w-full gap-2 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Reading Session
                    </>
                  )}
                </Button>

                {successMessage && (
                  <div
                    data-testid="reading-log-success"
                    className="p-3 text-xs sm:text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 mt-2"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="shadow-subtle order-1 xl:order-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-serif">Summary</CardTitle>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 3 Stat Tiles in a row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                {/* Tile 1: Sessions */}
                <div className="p-3 rounded-xl bg-secondary/80 border border-border/60">
                  <div className="flex justify-center mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-foreground tabular-nums">
                    <span data-testid="reading-log-count">{summary.count}</span>
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                    Sessions
                  </div>
                </div>

                {/* Tile 2: Favorites */}
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40">
                  <div className="flex justify-center mb-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    <span data-testid="favorite-count">{summary.favoriteCount}</span>
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                    Favorites
                  </div>
                </div>

                {/* Tile 3: Minutes */}
                <div className="p-3 rounded-xl bg-accent/60 border border-indigo-200/50 dark:border-indigo-900/40">
                  <div className="flex justify-center mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-primary tabular-nums">
                    <span data-testid="total-minutes">{summary.totalMinutes}</span>
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                    Minutes
                  </div>
                </div>
              </div>

              {/* Genre Breakdown List */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Minutes by Genre
                </div>

                <div data-testid="genre-breakdown" className="space-y-2.5">
                  {summary.breakdown.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2 text-center">
                      No reading data recorded yet
                    </p>
                  ) : (
                    summary.breakdown.map((row) => {
                      const style = getGenreStyle(row.genre);
                      const IconComponent = style.icon;
                      const percentage = Math.min(
                        100,
                        Math.round((row.total / maxTotalMinutes) * 100)
                      );

                      return (
                        <div
                          key={row.genre}
                          data-testid="breakdown-row"
                          className="p-2.5 rounded-xl bg-card border border-border/80 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 font-medium text-foreground">
                              <div
                                className={`h-6 w-6 rounded-lg ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0`}
                              >
                                <IconComponent className="h-3.5 w-3.5" />
                              </div>
                              <span data-testid="breakdown-name">{row.genre}</span>
                            </div>

                            <div className="flex items-center gap-3 tabular-nums">
                              <span className="text-muted-foreground">
                                <span data-testid="breakdown-count">{row.count}</span>{" "}
                                <span className="text-[10px]">
                                  {row.count === 1 ? "session" : "sessions"}
                                </span>
                              </span>
                              <span className="font-semibold text-foreground">
                                <span data-testid="breakdown-total">{row.total}</span>{" "}
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  min
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Decorative Progress Bar */}
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${style.barColor} rounded-full transition-[width] duration-500 motion-safe`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Filters + List (order-3 & 4 on mobile, 8 cols on desktop) */}
        <div className="w-full order-3 xl:order-none xl:col-span-8 space-y-6">
          {/* Filter Bar Toolbar */}
          <Card className="shadow-subtle">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search with inline clear */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    data-testid="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search book title or note..."
                    className="pl-9 pr-8"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Genre Select */}
                <div className="w-full sm:w-44 shrink-0">
                  <select
                    data-testid="filter-genre"
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="flex min-h-[44px] w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <option value="">All</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Favorites Only Toggle & Clear */}
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-xs font-medium cursor-pointer hover:bg-muted transition-colors select-none">
                    <input
                      type="checkbox"
                      data-testid="filter-favorite"
                      checked={favoriteFilter}
                      onChange={(e) => setFavoriteFilter(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Favorites only</span>
                  </label>

                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid="btn-clear-filters"
                    onClick={clearFilters}
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
                    title="Reset filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reading Log List */}
          <div>
            {logsLoading && readingLogs.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-3.5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : readingLogs.length === 0 ? (
              <Card
                data-testid="reading-logs-empty"
                className="py-16 text-center border-dashed border-2 border-border/80 shadow-none bg-card/60"
              >
                <div className="max-w-xs mx-auto space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h3 className="font-serif font-medium text-lg text-foreground">
                    No reading sessions found
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your filters or record a new session to populate your journal.
                  </p>
                </div>
              </Card>
            ) : (
              <div data-testid="reading-log-list" className="space-y-3">
                {readingLogs.map((log) => {
                  const style = getGenreStyle(log.genre);
                  const IconComponent = style.icon;

                  return (
                    <div
                      key={log.id}
                      data-testid="reading-log-item"
                      className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-subtle hover:shadow-subtle-hover hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left & Middle info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={`h-11 w-11 rounded-xl ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Title */}
                          <h4
                            data-testid="reading-log-title"
                            title={log.bookTitle}
                            className="font-medium text-base text-foreground truncate"
                          >
                            {log.bookTitle}
                          </h4>

                          {/* Meta Row: Genre Badge, Date, Minutes */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
                            >
                              <span data-testid="reading-log-genre">{log.genre}</span>
                            </span>

                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span data-testid="reading-log-date">{log.readOn}</span>
                            </div>

                            <div className="flex items-center gap-1 font-medium text-foreground tabular-nums">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span data-testid="reading-log-minutes">{log.minutesRead}</span>
                              <span className="text-muted-foreground font-normal">min</span>
                            </div>
                          </div>

                          {/* Optional Note (clamped to 2 lines) */}
                          {log.note && (
                            <p className="text-xs text-muted-foreground italic line-clamp-2 pt-1">
                              &ldquo;{log.note}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                        {/* Toggle Favorite Button */}
                        <button
                          type="button"
                          data-testid="btn-toggle-favorite"
                          aria-pressed={log.favorite ? "true" : "false"}
                          onClick={() => toggleFavorite(log.id, log.favorite)}
                          className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all ${
                            log.favorite
                              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-500 scale-105 shadow-sm"
                              : "bg-card border-input text-muted-foreground hover:text-amber-500 hover:border-amber-300"
                          }`}
                          title={log.favorite ? "Unmark favorite" : "Mark as favorite"}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              log.favorite ? "fill-amber-400 text-amber-500" : ""
                            }`}
                          />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          data-testid="btn-delete-reading-log"
                          aria-label="Delete"
                          onClick={() => deleteReadingLog(log.id)}
                          className="h-10 w-10 rounded-xl border border-transparent hover:border-destructive/30 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
                          title="Delete reading session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
