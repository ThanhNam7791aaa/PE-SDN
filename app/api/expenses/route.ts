import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  validateTitle,
  validateAmount,
  validateCategory,
  validateSpentAt,
  formatExpense,
} from "@/lib/expense-validation";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categoryParam = searchParams.get("category");
  const starredParam = searchParams.get("starred");
  const qParam = searchParams.get("q");

  const where: any = {
    userId: user.id,
  };

  if (categoryParam && categoryParam.trim()) {
    where.category = categoryParam.trim();
  }

  if (starredParam === "true") {
    where.starred = true;
  }

  if (qParam && qParam.trim()) {
    const q = qParam.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { note: { contains: q, mode: "insensitive" } },
    ];
  }

  try {
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: [
        { spentAt: "desc" },
        { title: "asc" },
      ],
    });

    // Stable secondary sort: ties broken by title, alphabetically, case-insensitive
    expenses.sort((a, b) => {
      if (a.spentAt !== b.spentAt) {
        return a.spentAt < b.spentAt ? 1 : -1;
      }
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    });

    return NextResponse.json(expenses.map(formatExpense), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, amount, category, note, spentAt } = body;

    // Validation
    const titleVal = validateTitle(title);
    if (titleVal.error) {
      return NextResponse.json({ error: titleVal.error }, { status: 400 });
    }

    const amountVal = validateAmount(amount);
    if (amountVal.error) {
      return NextResponse.json({ error: amountVal.error }, { status: 400 });
    }

    const categoryVal = validateCategory(category);
    if (categoryVal.error) {
      return NextResponse.json({ error: categoryVal.error }, { status: 400 });
    }

    const spentAtVal = validateSpentAt(spentAt);
    if (spentAtVal.error) {
      return NextResponse.json({ error: spentAtVal.error }, { status: 400 });
    }

    const cleanTitle = titleVal.value!;
    const cleanAmount = amountVal.value!;
    const cleanCategory = categoryVal.value!;
    const cleanSpentAt = spentAtVal.value!;
    const cleanNote = typeof note === "string" ? note.trim() : "";

    // Duplicate check
    const existing = await prisma.expense.findFirst({
      where: {
        userId: user.id,
        title: cleanTitle,
        amount: cleanAmount,
        spentAt: cleanSpentAt,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Duplicate expense: an expense with the same title, amount and date already exists" },
        { status: 409 }
      );
    }

    const created = await prisma.expense.create({
      data: {
        userId: user.id,
        title: cleanTitle,
        amount: cleanAmount,
        category: cleanCategory,
        note: cleanNote,
        spentAt: cleanSpentAt,
        starred: false,
      },
    });

    return NextResponse.json(formatExpense(created), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

