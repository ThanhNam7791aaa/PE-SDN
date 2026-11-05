"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  starred: boolean;
  spentAt: string;
  createdAt: string;
}

export interface ExpenseSummary {
  count: number;
  starredCount: number;
  totalAmount: number;
  breakdown: Array<{
    category: string;
    count: number;
    total: number;
  }>;
}

interface ExpenseContextType {
  expenses: Expense[];
  summary: ExpenseSummary;
  loading: boolean;
  categoryFilter: string;
  starredFilter: boolean;
  searchQuery: string;
  setCategoryFilter: (category: string) => void;
  setStarredFilter: (starred: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  fetchData: () => Promise<void>;
  addExpense: (data: {
    title: string;
    amount: number;
    category: string;
    note?: string;
    spentAt: string;
  }) => Promise<{ success: boolean; error?: string }>;
  toggleStar: (id: string, currentStarred: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetExpenses: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({
    count: 0,
    starredCount: 0,
    totalAmount: 0,
    breakdown: [],
  });
  const [loading, setLoading] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [starredFilter, setStarredFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const resetExpenses = useCallback(() => {
    setExpenses([]);
    setSummary({
      count: 0,
      starredCount: 0,
      totalAmount: 0,
      breakdown: [],
    });
    setCategoryFilter("");
    setStarredFilter(false);
    setSearchQuery("");
  }, []);

  // When user logs out or changes, reset data
  useEffect(() => {
    if (!user) {
      resetExpenses();
    }
  }, [user, resetExpenses]);

  const fetchData = useCallback(
    async (overrideFilters?: { category?: string; starred?: boolean; q?: string }) => {
      if (!user) return;
      setLoading(true);

      const cat = overrideFilters?.category !== undefined ? overrideFilters.category : categoryFilter;
      const star = overrideFilters?.starred !== undefined ? overrideFilters.starred : starredFilter;
      const q = overrideFilters?.q !== undefined ? overrideFilters.q : searchQuery;

      const params = new URLSearchParams();
      if (cat) params.set("category", cat);
      if (star) params.set("starred", "true");
      if (q) params.set("q", q);

      const qs = params.toString() ? `?${params.toString()}` : "";

      try {
        const [expensesRes, summaryRes] = await Promise.all([
          fetch(`/api/expenses${qs}`),
          fetch(`/api/expenses/summary${qs}`),
        ]);

        if (expensesRes.ok && summaryRes.ok) {
          const expData = await expensesRes.json();
          const sumData = await summaryRes.json();
          setExpenses(expData);
          setSummary(sumData);
        }
      } catch (err) {
        console.error("Failed to load expenses or summary:", err);
      } finally {
        setLoading(false);
      }
    },
    [user, categoryFilter, starredFilter, searchQuery]
  );

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, categoryFilter, starredFilter, searchQuery, fetchData]);

  const clearFilters = () => {
    setCategoryFilter("");
    setStarredFilter(false);
    setSearchQuery("");
  };

  const addExpense = async (data: {
    title: string;
    amount: number;
    category: string;
    note?: string;
    spentAt: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Failed to add expense" };
      }

      await fetchData();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const toggleStar = async (id: string, currentStarred: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !currentStarred }),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Failed to toggle star" };
      }

      await fetchData();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const deleteExpense = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Failed to delete expense" };
      }

      await fetchData();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        summary,
        loading,
        categoryFilter,
        starredFilter,
        searchQuery,
        setCategoryFilter,
        setStarredFilter,
        setSearchQuery,
        clearFilters,
        fetchData,
        addExpense,
        toggleStar,
        deleteExpense,
        resetExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
}

