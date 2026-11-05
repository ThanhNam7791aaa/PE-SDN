export const VALID_CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Other"] as const;
export type ValidCategory = (typeof VALID_CATEGORIES)[number];

export function validateTitle(title: unknown): { error?: string; value?: string } {
  if (title === undefined || title === null || typeof title !== "string" || !title.trim()) {
    return { error: "Title is required" };
  }
  const trimmed = title.trim();
  if (trimmed.length > 80) {
    return { error: "Title must be at most 80 characters" };
  }
  return { value: trimmed };
}

export function validateAmount(amount: unknown): { error?: string; value?: number } {
  if (amount === undefined || amount === null || amount === "" || (typeof amount === "string" && !amount.trim())) {
    return { error: "Amount is required" };
  }
  const num = Number(amount);
  if (isNaN(num)) {
    return { error: "Amount is required" };
  }
  if (num <= 0) {
    return { error: "Amount must be a positive number" };
  }
  // 2 decimal places round
  const rounded = Math.round(num * 100) / 100;
  return { value: rounded };
}

export function validateCategory(category: unknown): { error?: string; value?: string } {
  if (category === undefined || category === null || category === "") {
    return { error: "Please choose a category" };
  }
  if (typeof category !== "string" || !VALID_CATEGORIES.includes(category as ValidCategory)) {
    return { error: "Invalid category" };
  }
  return { value: category };
}

export function validateSpentAt(spentAt: unknown): { error?: string; value?: string } {
  if (spentAt === undefined || spentAt === null || typeof spentAt !== "string" || !spentAt.trim()) {
    return { error: "Date is required" };
  }
  const trimmed = spentAt.trim();

  // Validate format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(trimmed)) {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      return { error: "Date is required" };
    }
  }

  // Compare with today
  const now = new Date();
  const utcToday = now.toISOString().split("T")[0];
  const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  // If it's strictly greater than both local and UTC today, it's definitely in the future
  if (trimmed > localToday && trimmed > utcToday) {
    return { error: "Date cannot be in the future" };
  }

  return { value: trimmed };
}

export function formatExpense(e: {
  id: string;
  title: string;
  amount: number;
  category: string;
  note: string | null;
  starred: boolean;
  spentAt: string;
  createdAt: Date;
}) {
  return {
    id: e.id,
    title: e.title,
    amount: Number(e.amount),
    category: e.category,
    note: e.note ?? "",
    starred: Boolean(e.starred),
    spentAt: e.spentAt,
    createdAt: e.createdAt.toISOString(),
  };
}

