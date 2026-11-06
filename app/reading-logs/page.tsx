"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useReadingLogs } from "@/context/reading-log-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Trash2 } from "lucide-react";

const GENRES = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"] as const;

export default function ReadingLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    readingLogs,
    summary,
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

  // Auth protection: no content flashed while checking
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return null;
  }

  // Field validation helpers
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
    } else {
      setApiError(result.error || "Failed to add reading session");
    }
  };

  return (
    <div data-testid="reading-logs-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Summary */}
        <div className="xl:col-span-5 space-y-8">
          {/* Add Reading Session Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Add a Reading Session</CardTitle>
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
                    className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
                  >
                    {apiError}
                  </div>
                )}

                {successMessage && (
                  <div
                    data-testid="reading-log-success"
                    className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md"
                  >
                    {successMessage}
                  </div>
                )}

                {/* Book title */}
                <div className="space-y-1">
                  <Label htmlFor="bookTitle">Book title</Label>
                  <Input
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
                    <p data-testid="error-book-title" className="text-xs text-red-600 mt-1">
                      {bookTitleError}
                    </p>
                  )}
                </div>

                {/* Minutes read */}
                <div className="space-y-1">
                  <Label htmlFor="minutesRead">Minutes read</Label>
                  <Input
                    id="minutesRead"
                    type="number"
                    step="1"
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
                    <p data-testid="error-minutes" className="text-xs text-red-600 mt-1">
                      {minutesError}
                    </p>
                  )}
                </div>

                {/* Genre */}
                <div className="space-y-1">
                  <Label htmlFor="genre">Genre</Label>
                  <select
                    id="genre"
                    data-testid="input-genre"
                    value={genre}
                    onChange={(e) => {
                      setGenre(e.target.value);
                      setApiError("");
                      setSuccessMessage("");
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Choose genre</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  {genreError && (
                    <p data-testid="error-genre" className="text-xs text-red-600 mt-1">
                      {genreError}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <Label htmlFor="date">Date</Label>
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
                    <p data-testid="error-date" className="text-xs text-red-600 mt-1">
                      {dateError}
                    </p>
                  )}
                </div>

                {/* Note */}
                <div className="space-y-1">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Input
                    id="note"
                    data-testid="input-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Chapter 3"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-reading-log"
                  className="w-full mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Reading Session"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reading Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Reading Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <div className="text-xs font-medium text-gray-500 uppercase">Sessions</div>
                  <div data-testid="reading-log-count" className="text-2xl font-bold text-gray-900 mt-1">
                    {summary.count}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border">
                  <div className="text-xs font-medium text-gray-500 uppercase">Favorites</div>
                  <div data-testid="favorite-count" className="text-2xl font-bold text-red-500 mt-1">
                    {summary.favoriteCount}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border">
                  <div className="text-xs font-medium text-gray-500 uppercase">Minutes</div>
                  <div data-testid="total-minutes" className="text-2xl font-bold text-blue-600 mt-1">
                    {summary.totalMinutes}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Genre Breakdown</h4>
                <div data-testid="genre-breakdown" className="space-y-2">
                  {summary.breakdown.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No genre data</p>
                  ) : (
                    summary.breakdown.map((row) => (
                      <div
                        key={row.genre}
                        data-testid="breakdown-row"
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-md border text-sm"
                      >
                        <span data-testid="breakdown-name" className="font-medium text-gray-800">
                          {row.genre}
                        </span>
                        <div className="flex items-center gap-4">
                          <span data-testid="breakdown-count" className="text-xs text-gray-500">
                            {row.count} {row.count === 1 ? "session" : "sessions"}
                          </span>
                          <span data-testid="breakdown-total" className="font-semibold text-gray-900">
                            {row.total}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Filters & List */}
        <div className="xl:col-span-7 space-y-6">
          {/* Filters & Search */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search */}
                <div>
                  <Input
                    data-testid="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search book title or note..."
                  />
                </div>

                {/* Genre filter */}
                <div>
                  <select
                    data-testid="filter-genre"
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">All</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Favorites filter & Clear button */}
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input
                      type="checkbox"
                      data-testid="filter-favorite"
                      checked={favoriteFilter}
                      onChange={(e) => setFavoriteFilter(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Favorites only</span>
                  </label>

                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="btn-clear-filters"
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reading Log List */}
          <div>
            {readingLogs.length === 0 ? (
              <div
                data-testid="reading-logs-empty"
                className="text-center py-16 bg-white border rounded-lg shadow-sm"
              >
                <p className="text-gray-500 font-medium">No reading sessions found</p>
              </div>
            ) : (
              <div data-testid="reading-log-list" className="space-y-3">
                {readingLogs.map((log) => (
                  <div
                    key={log.id}
                    data-testid="reading-log-item"
                    className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span data-testid="reading-log-title" className="font-semibold text-gray-900">
                          {log.bookTitle}
                        </span>
                        <span
                          data-testid="reading-log-genre"
                          className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {log.genre}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span data-testid="reading-log-date">{log.readOn}</span>
                        {log.note && (
                          <span className="italic text-gray-400 max-w-xs truncate">
                            {log.note}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <span data-testid="reading-log-minutes" className="font-bold text-gray-900 text-base">
                          {log.minutesRead}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">mins</span>
                      </div>

                      <button
                        type="button"
                        data-testid="btn-toggle-favorite"
                        aria-pressed={log.favorite ? "true" : "false"}
                        onClick={() => toggleFavorite(log.id, log.favorite)}
                        className={`p-2 rounded-full border transition-colors ${
                          log.favorite
                            ? "bg-red-50 border-red-300 text-red-500 hover:bg-red-100"
                            : "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
                        }`}
                        title={log.favorite ? "Unmark favorite" : "Mark as favorite"}
                      >
                        <Heart className={`h-4 w-4 ${log.favorite ? "fill-red-500" : ""}`} />
                      </button>

                      <button
                        type="button"
                        data-testid="btn-delete-reading-log"
                        onClick={() => deleteReadingLog(log.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                        title="Delete reading session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

