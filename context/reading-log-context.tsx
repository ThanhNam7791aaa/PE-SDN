"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";

export interface ReadingLog {
  id: string;
  bookTitle: string;
  minutesRead: number;
  genre: string;
  note: string;
  favorite: boolean;
  readOn: string;
  createdAt: string;
}

export interface ReadingLogSummary {
  count: number;
  favoriteCount: number;
  totalMinutes: number;
  breakdown: Array<{
    genre: string;
    count: number;
    total: number;
  }>;
}

interface ReadingLogContextType {
  readingLogs: ReadingLog[];
  summary: ReadingLogSummary;
  loading: boolean;
  genreFilter: string;
  favoriteFilter: boolean;
  searchQuery: string;
  setGenreFilter: (genre: string) => void;
  setFavoriteFilter: (favorite: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  fetchData: () => Promise<void>;
  addReadingLog: (data: {
    bookTitle: string;
    minutesRead: number;
    genre: string;
    note?: string;
    readOn: string;
  }) => Promise<{ success: boolean; error?: string }>;
  toggleFavorite: (id: string, currentFavorite: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteReadingLog: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetReadingLogs: () => void;
}

const ReadingLogContext = createContext<ReadingLogContextType | undefined>(undefined);

export function ReadingLogProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [summary, setSummary] = useState<ReadingLogSummary>({
    count: 0,
    favoriteCount: 0,
    totalMinutes: 0,
    breakdown: [],
  });
  const [loading, setLoading] = useState(false);

  const [genreFilter, setGenreFilter] = useState("");
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const resetReadingLogs = useCallback(() => {
    setReadingLogs([]);
    setSummary({
      count: 0,
      favoriteCount: 0,
      totalMinutes: 0,
      breakdown: [],
    });
    setGenreFilter("");
    setFavoriteFilter(false);
    setSearchQuery("");
  }, []);

  // When user logs out or changes, reset data
  useEffect(() => {
    if (!user) {
      resetReadingLogs();
    }
  }, [user, resetReadingLogs]);

  const fetchData = useCallback(
    async (overrideFilters?: { genre?: string; favorite?: boolean; q?: string }) => {
      if (!user) return;
      setLoading(true);

      const g = overrideFilters?.genre !== undefined ? overrideFilters.genre : genreFilter;
      const fav = overrideFilters?.favorite !== undefined ? overrideFilters.favorite : favoriteFilter;
      const q = overrideFilters?.q !== undefined ? overrideFilters.q : searchQuery;

      const params = new URLSearchParams();
      if (g) params.set("genre", g);
      if (fav) params.set("favorite", "true");
      if (q) params.set("q", q);

      const qs = params.toString() ? `?${params.toString()}` : "";

      try {
        const [logsRes, summaryRes] = await Promise.all([
          fetch(`/api/reading-logs${qs}`),
          fetch(`/api/reading-logs/summary${qs}`),
        ]);

        if (logsRes.ok && summaryRes.ok) {
          const lData = await logsRes.json();
          const sData = await summaryRes.json();
          setReadingLogs(lData);
          setSummary(sData);
        }
      } catch (err) {
        console.error("Failed to load reading logs or summary:", err);
      } finally {
        setLoading(false);
      }
    },
    [user, genreFilter, favoriteFilter, searchQuery]
  );

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, genreFilter, favoriteFilter, searchQuery, fetchData]);

  const clearFilters = () => {
    setGenreFilter("");
    setFavoriteFilter(false);
    setSearchQuery("");
  };

  const addReadingLog = async (data: {
    bookTitle: string;
    minutesRead: number;
    genre: string;
    note?: string;
    readOn: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/reading-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Failed to add reading session" };
      }

      await fetchData();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const toggleFavorite = async (
    id: string,
    currentFavorite: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/reading-logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !currentFavorite }),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Failed to toggle favorite" };
      }

      await fetchData();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const deleteReadingLog = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/reading-logs/${id}`, {
        method: "DELETE",
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Failed to delete reading session" };
      }

      await fetchData();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  return (
    <ReadingLogContext.Provider
      value={{
        readingLogs,
        summary,
        loading,
        genreFilter,
        favoriteFilter,
        searchQuery,
        setGenreFilter,
        setFavoriteFilter,
        setSearchQuery,
        clearFilters,
        fetchData,
        addReadingLog,
        toggleFavorite,
        deleteReadingLog,
        resetReadingLogs,
      }}
    >
      {children}
    </ReadingLogContext.Provider>
  );
}

export function useReadingLogs() {
  const context = useContext(ReadingLogContext);
  if (!context) {
    throw new Error("useReadingLogs must be used within a ReadingLogProvider");
  }
  return context;
}

