import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const CATEGORY_PRIORITY: Record<string, number> = {
  Food: 1,
  Transport: 2,
  Bills: 3,
  Shopping: 4,
  Other: 5,
};

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
    });

    if (expenses.length === 0) {
      return NextResponse.json(
        {
          count: 0,
          starredCount: 0,
          totalAmount: 0,
          breakdown: [],
        },
        { status: 200 }
      );
    }

    let starredCount = 0;
    let rawTotalAmount = 0;
    const categoryMap: Record<string, { count: number; total: number }> = {};

    for (const exp of expenses) {
      if (exp.starred) {
        starredCount++;
      }
      const amt = Number(exp.amount);
      rawTotalAmount += amt;

      if (!categoryMap[exp.category]) {
        categoryMap[exp.category] = { count: 0, total: 0 };
      }
      categoryMap[exp.category].count += 1;
      categoryMap[exp.category].total += amt;
    }

    const totalAmount = Math.round(rawTotalAmount * 100) / 100;

    const breakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      count: categoryMap[cat].count,
      total: Math.round(categoryMap[cat].total * 100) / 100,
    }));

    // Sắp xếp breakdown:
    // 1. total amount descending
    // 2. equal totals: Food, Transport, Bills, Shopping, Other
    breakdown.sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      const prioA = CATEGORY_PRIORITY[a.category] ?? 99;
      const prioB = CATEGORY_PRIORITY[b.category] ?? 99;
      return prioA - prioB;
    });

    return NextResponse.json(
      {
        count: expenses.length,
        starredCount,
        totalAmount,
        breakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}

