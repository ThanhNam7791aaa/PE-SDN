"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useExpenses } from "@/context/expense-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Trash2 } from "lucide-react";

const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Other"] as const;

export default function ExpensesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    expenses,
    summary,
    categoryFilter,
    starredFilter,
    searchQuery,
    setCategoryFilter,
    setStarredFilter,
    setSearchQuery,
    clearFilters,
    addExpense,
    toggleStar,
    deleteExpense,
  } = useExpenses();

  // Expense form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication check: avoid flashing content
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return null;
  }

  // Field validation helpers
  const getTitleError = (val: string) => {
    if (!val.trim()) return "Title is required";
    if (val.trim().length > 80) return "Title must be at most 80 characters";
    return "";
  };

  const getAmountError = (val: string) => {
    if (!val || !val.trim()) return "Amount is required";
    const num = Number(val);
    if (isNaN(num)) return "Amount is required";
    if (num <= 0) return "Amount must be a positive number";
    return "";
  };

  const getCategoryError = (val: string) => {
    if (!val) return "Please choose a category";
    if (!CATEGORIES.includes(val as any)) return "Invalid category";
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

  const titleError = hasSubmitted ? getTitleError(title) : "";
  const amountError = hasSubmitted ? getAmountError(amount) : "";
  const categoryError = hasSubmitted ? getCategoryError(category) : "";
  const dateError = hasSubmitted ? getDateError(date) : "";

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setApiError("");
    setSuccessMessage("");

    const tErr = getTitleError(title);
    const aErr = getAmountError(amount);
    const cErr = getCategoryError(category);
    const dErr = getDateError(date);

    if (tErr || aErr || cErr || dErr) {
      return;
    }

    setIsSubmitting(true);
    const result = await addExpense({
      title: title.trim(),
      amount: Number(amount),
      category,
      note: note.trim(),
      spentAt: date,
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage("Expense added");
      setTitle("");
      setAmount("");
      setCategory("");
      setNote("");
      setDate("");
      setHasSubmitted(false);
    } else {
      setApiError(result.error || "Failed to add expense");
    }
  };

  return (
    <div data-testid="expenses-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Summary */}
        <div className="xl:col-span-5 space-y-8">
          {/* Add Expense Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                data-testid="expense-form"
                noValidate
                onSubmit={handleAddExpense}
                className="space-y-4"
              >
                {apiError && (
                  <div
                    data-testid="error-expense"
                    className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
                  >
                    {apiError}
                  </div>
                )}

                {successMessage && (
                  <div
                    data-testid="expense-success"
                    className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md"
                  >
                    {successMessage}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    data-testid="input-title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setApiError("");
                      setSuccessMessage("");
                    }}
                    placeholder="e.g. Grab to campus"
                  />
                  {titleError && (
                    <p data-testid="error-title" className="text-xs text-red-600 mt-1">
                      {titleError}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    data-testid="input-amount"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setApiError("");
                      setSuccessMessage("");
                    }}
                    placeholder="e.g. 45000"
                  />
                  {amountError && (
                    <p data-testid="error-amount" className="text-xs text-red-600 mt-1">
                      {amountError}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    data-testid="input-category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setApiError("");
                      setSuccessMessage("");
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Choose category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {categoryError && (
                    <p data-testid="error-category" className="text-xs text-red-600 mt-1">
                      {categoryError}
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
                    placeholder="e.g. Morning class"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-expense"
                  className="w-full mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Spending Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Spending Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <div className="text-xs font-medium text-gray-500 uppercase">Expenses</div>
                  <div data-testid="expense-count" className="text-2xl font-bold text-gray-900 mt-1">
                    {summary.count}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border">
                  <div className="text-xs font-medium text-gray-500 uppercase">Starred</div>
                  <div data-testid="starred-count" className="text-2xl font-bold text-amber-600 mt-1">
                    {summary.starredCount}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border">
                  <div className="text-xs font-medium text-gray-500 uppercase">Total</div>
                  <div data-testid="total-amount" className="text-2xl font-bold text-blue-600 mt-1">
                    {Number(summary.totalAmount).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h4>
                <div data-testid="category-breakdown" className="space-y-2">
                  {summary.breakdown.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No category data</p>
                  ) : (
                    summary.breakdown.map((row) => (
                      <div
                        key={row.category}
                        data-testid="breakdown-row"
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-md border text-sm"
                      >
                        <span data-testid="breakdown-name" className="font-medium text-gray-800">
                          {row.category}
                        </span>
                        <div className="flex items-center gap-4">
                          <span data-testid="breakdown-count" className="text-xs text-gray-500">
                            {row.count} {row.count === 1 ? "expense" : "expenses"}
                          </span>
                          <span data-testid="breakdown-total" className="font-semibold text-gray-900">
                            {Number(row.total).toFixed(2)}
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

        {/* Right Column: Filters & Expenses List */}
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
                    placeholder="Search title or note..."
                  />
                </div>

                {/* Category filter */}
                <div>
                  <select
                    data-testid="filter-category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">All</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Starred filter & Clear button */}
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input
                      type="checkbox"
                      data-testid="filter-starred"
                      checked={starredFilter}
                      onChange={(e) => setStarredFilter(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Starred only</span>
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

          {/* Expense List */}
          <div>
            {expenses.length === 0 ? (
              <div
                data-testid="expenses-empty"
                className="text-center py-16 bg-white border rounded-lg shadow-sm"
              >
                <p className="text-gray-500 font-medium">No expenses found</p>
              </div>
            ) : (
              <div data-testid="expense-list" className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    data-testid="expense-item"
                    className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span data-testid="expense-title" className="font-semibold text-gray-900">
                          {expense.title}
                        </span>
                        <span
                          data-testid="expense-category"
                          className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {expense.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span data-testid="expense-date">{expense.spentAt}</span>
                        {expense.note && (
                          <span className="italic text-gray-400 max-w-xs truncate">
                            {expense.note}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span data-testid="expense-amount" className="font-bold text-gray-900 text-base">
                        {Number(expense.amount).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        data-testid="btn-toggle-star"
                        aria-pressed={expense.starred ? "true" : "false"}
                        onClick={() => toggleStar(expense.id, expense.starred)}
                        className={`p-2 rounded-full border transition-colors ${
                          expense.starred
                            ? "bg-amber-50 border-amber-300 text-amber-500 hover:bg-amber-100"
                            : "bg-white border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-200"
                        }`}
                        title={expense.starred ? "Unstar expense" : "Star expense"}
                      >
                        <Star className={`h-4 w-4 ${expense.starred ? "fill-amber-400" : ""}`} />
                      </button>

                      <button
                        type="button"
                        data-testid="btn-delete-expense"
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                        title="Delete expense"
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

