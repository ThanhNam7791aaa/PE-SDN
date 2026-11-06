export const VALID_GENRES = [
  "Fiction",
  "Non-Fiction",
  "Sci-Fi",
  "Biography",
  "Other",
] as const;

export type ValidGenre = (typeof VALID_GENRES)[number];

export function validateBookTitle(bookTitle: unknown): { error?: string; value?: string } {
  if (bookTitle === undefined || bookTitle === null || typeof bookTitle !== "string" || !bookTitle.trim()) {
    return { error: "Book title is required" };
  }
  const trimmed = bookTitle.trim();
  if (trimmed.length > 80) {
    return { error: "Book title must be at most 80 characters" };
  }
  return { value: trimmed };
}

export function validateMinutesRead(minutesRead: unknown): { error?: string; value?: number } {
  if (
    minutesRead === undefined ||
    minutesRead === null ||
    minutesRead === "" ||
    (typeof minutesRead === "string" && !minutesRead.trim())
  ) {
    return { error: "Minutes read is required" };
  }
  const num = Number(minutesRead);
  if (isNaN(num)) {
    return { error: "Minutes read is required" };
  }
  if (num <= 0) {
    return { error: "Minutes read must be a positive number" };
  }
  // Positive whole number
  const intVal = Math.floor(num);
  return { value: intVal };
}

export function validateGenre(genre: unknown): { error?: string; value?: string } {
  if (genre === undefined || genre === null || genre === "") {
    return { error: "Please choose a genre" };
  }
  if (typeof genre !== "string" || !VALID_GENRES.includes(genre as ValidGenre)) {
    return { error: "Invalid genre" };
  }
  return { value: genre };
}

export function validateReadOn(readOn: unknown): { error?: string; value?: string } {
  if (readOn === undefined || readOn === null || typeof readOn !== "string" || !readOn.trim()) {
    return { error: "Date is required" };
  }
  const trimmed = readOn.trim();

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

  // If strictly greater than both local and UTC today, it's definitely in the future
  if (trimmed > localToday && trimmed > utcToday) {
    return { error: "Date cannot be in the future" };
  }

  return { value: trimmed };
}

export function formatReadingLog(r: {
  id: string;
  bookTitle: string;
  minutesRead: number;
  genre: string;
  note: string | null;
  favorite: boolean;
  readOn: string;
  createdAt: Date;
}) {
  return {
    id: r.id,
    bookTitle: r.bookTitle,
    minutesRead: Number(r.minutesRead),
    genre: r.genre,
    note: r.note ?? "",
    favorite: Boolean(r.favorite),
    readOn: r.readOn,
    createdAt: r.createdAt.toISOString(),
  };
}

