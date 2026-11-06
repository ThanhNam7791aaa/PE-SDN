"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useReadingLogs } from "@/context/reading-log-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getGenreStyle } from "@/lib/genre-styles";
import {
  BookOpen,
  Calendar,
  Clock,
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
      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-6 items-start">
        {/* Left column: Add form & Summary */}
        <div className="w-full order-1 xl:order-none xl:col-span-4 space-y-6 xl:sticky xl:top-20 self-start">
          {/* Add Reading Session Card */}
          <Card className="shadow-subtle border-border order-2 xl:order-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Add reading session</CardTitle>
                <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                  <Plus className="h-5 w-5" />
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
                    className="p-3 text-xs sm:text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-xl flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Book Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="bookTitle" className="text-xs font-semibold text-foreground">
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
                    className="border-slate-300 dark:border-slate-700 font-medium"
                  />
                  {bookTitleError && (
                    <div
                      data-testid="error-book-title"
                      className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium mt-1"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{bookTitleError}</span>
                    </div>
                  )}
                </div>

                {/* 2-Column: Minutes + Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Minutes Read */}
                  <div className="space-y-1.5">
                    <Label htmlFor="minutesRead" className="text-xs font-semibold text-foreground">
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
                      className="border-slate-300 dark:border-slate-700 font-medium"
                    />
                    {minutesError && (
                      <div
                        data-testid="error-minutes"
                        className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium mt-1"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{minutesError}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs font-semibold text-foreground">
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
                      className="border-slate-300 dark:border-slate-700 font-medium"
                    />
                    {dateError && (
                      <div
                        data-testid="error-date"
                        className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium mt-1"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{dateError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Genre */}
                <div className="space-y-1.5">
                  <Label htmlFor="genre" className="text-xs font-semibold text-foreground">
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
                    className="flex min-h-[44px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-card px-3.5 py-2 text-base sm:text-sm text-foreground font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
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
                      className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium mt-1"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{genreError}</span>
                    </div>
                  )}
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <Label htmlFor="note" className="text-xs font-semibold text-foreground">
                    Note <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="note"
                    data-testid="input-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note"
                    className="border-slate-300 dark:border-slate-700"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-reading-log"
                  className="w-full gap-2 font-semibold shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
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
                    className="p-3 text-xs sm:text-sm text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-950/60 border border-green-300 dark:border-green-800 rounded-xl flex items-center gap-2 mt-2 font-medium"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="shadow-subtle border-border order-1 xl:order-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold font-serif">Summary</CardTitle>
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 3 Stat Tiles */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                {/* Tile 1: Sessions */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
                  <div className="flex justify-center mb-1">
                    <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-foreground tabular-nums">
                    <span data-testid="reading-log-count">{summary.count}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mt-0.5">
                    Sessions
                  </div>
                </div>

                {/* Tile 2: Favorites */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                  <div className="flex justify-center mb-1">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    <span data-testid="favorite-count">{summary.favoriteCount}</span>
                  </div>
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mt-0.5">
                    Favorites
                  </div>
                </div>

                {/* Tile 3: Minutes */}
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800">
                  <div className="flex justify-center mb-1">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 font-bold" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    <span data-testid="total-minutes">{summary.totalMinutes}</span>
                  </div>
                  <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mt-0.5">
                    Minutes
                  </div>
                </div>
              </div>

              {/* Genre Breakdown List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-foreground uppercase tracking-wider">
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
                          className="p-3 rounded-xl bg-card border border-border shadow-sm space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 font-bold text-foreground">
                              <div
                                className={`h-7 w-7 rounded-lg ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0 border border-border/50`}
                              >
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <span data-testid="breakdown-name" className="text-sm font-semibold">
                                {row.genre}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 tabular-nums font-semibold">
                              <span className="text-slate-600 dark:text-slate-300">
                                <span data-testid="breakdown-count">{row.count}</span>{" "}
                                <span className="text-[11px] font-normal text-muted-foreground">
                                  {row.count === 1 ? "session" : "sessions"}
                                </span>
                              </span>
                              <span className="text-foreground text-sm">
                                <span data-testid="breakdown-total">{row.total}</span>{" "}
                                <span className="text-[11px] text-muted-foreground font-normal">
                                  min
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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

        {/* Right column: Filter toolbar + List */}
        <div className="w-full order-3 xl:order-none xl:col-span-8 space-y-6">
          {/* Toolbar */}
          <Card className="shadow-subtle border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600 dark:text-indigo-400 font-bold pointer-events-none" />
                  <Input
                    data-testid="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search book title or note..."
                    className="pl-10 pr-9 border-slate-300 dark:border-slate-700 font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-foreground rounded-md transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Genre Select */}
                <div className="w-full sm:w-44 shrink-0">
                  <select
                    data-testid="filter-genre"
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="flex min-h-[44px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-card px-3 py-2 text-sm text-foreground font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  >
                    <option value="">All</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Favorites Only & Clear */}
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-card text-xs font-semibold text-foreground cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none shadow-sm">
                    <input
                      type="checkbox"
                      data-testid="filter-favorite"
                      checked={favoriteFilter}
                      onChange={(e) => setFavoriteFilter(e.target.checked)}
                      className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Favorites only</span>
                  </label>

                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="btn-clear-filters"
                    onClick={clearFilters}
                    className="gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                    title="Reset filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
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
                  <Card key={i} className="p-4 space-y-3 border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-3.5 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : readingLogs.length === 0 ? (
              <Card
                data-testid="reading-logs-empty"
                className="py-16 text-center border-dashed border-2 border-slate-300 dark:border-slate-700 shadow-none bg-card"
              >
                <div className="max-w-xs mx-auto space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 mx-auto flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-foreground">
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
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left & Middle */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={`h-12 w-12 rounded-xl ${style.iconBg} ${style.iconColor} border ${style.badgeBorder} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}
                        >
                          <IconComponent className="h-6 w-6" />
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Title */}
                          <h4
                            data-testid="reading-log-title"
                            title={log.bookTitle}
                            className="font-semibold text-base text-foreground truncate"
                          >
                            {log.bookTitle}
                          </h4>

                          {/* Meta Row: Genre Badge, Date, Minutes */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
                            >
                              <span data-testid="reading-log-genre">{log.genre}</span>
                            </span>

                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <span data-testid="reading-log-date">{log.readOn}</span>
                            </div>

                            <div className="flex items-center gap-1 font-bold text-foreground tabular-nums">
                              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span data-testid="reading-log-minutes">{log.minutesRead}</span>
                              <span className="text-muted-foreground font-normal text-xs">min</span>
                            </div>
                          </div>

                          {/* Note */}
                          {log.note && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-2 pt-1">
                              &ldquo;{log.note}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                        {/* Star Button */}
                        <button
                          type="button"
                          data-testid="btn-toggle-favorite"
                          aria-pressed={log.favorite ? "true" : "false"}
                          onClick={() => toggleFavorite(log.id, log.favorite)}
                          className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-all ${
                            log.favorite
                              ? "bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-600 scale-105 shadow-sm"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-400"
                          }`}
                          title={log.favorite ? "Unmark favorite" : "Mark as favorite"}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              log.favorite
                                ? "fill-amber-400 text-amber-500"
                                : "text-slate-400 hover:text-amber-500"
                            }`}
                          />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          data-testid="btn-delete-reading-log"
                          aria-label="Delete"
                          onClick={() => deleteReadingLog(log.id)}
                          className="h-11 w-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-red-400 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center justify-center transition-colors shadow-sm"
                          title="Delete reading session"
                        >
                          <Trash2 className="h-5 w-5" />
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
