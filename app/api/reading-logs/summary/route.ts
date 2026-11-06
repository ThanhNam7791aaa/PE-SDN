import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const GENRE_PRIORITY: Record<string, number> = {
  Fiction: 1,
  "Non-Fiction": 2,
  "Sci-Fi": 3,
  Biography: 4,
  Other: 5,
};

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const genreParam = searchParams.get("genre");
  const favoriteParam = searchParams.get("favorite");
  const qParam = searchParams.get("q");

  const where: any = {
    userId: user.id,
  };

  if (genreParam && genreParam.trim()) {
    where.genre = genreParam.trim();
  }

  if (favoriteParam === "true") {
    where.favorite = true;
  }

  if (qParam && qParam.trim()) {
    const q = qParam.trim();
    where.OR = [
      { bookTitle: { contains: q, mode: "insensitive" } },
      { note: { contains: q, mode: "insensitive" } },
    ];
  }

  try {
    const logs = await prisma.readingLog.findMany({
      where,
    });

    if (logs.length === 0) {
      return NextResponse.json(
        {
          count: 0,
          favoriteCount: 0,
          totalMinutes: 0,
          breakdown: [],
        },
        { status: 200 }
      );
    }

    let favoriteCount = 0;
    let totalMinutes = 0;
    const genreMap: Record<string, { count: number; total: number }> = {};

    for (const log of logs) {
      if (log.favorite) {
        favoriteCount++;
      }
      const mins = Number(log.minutesRead);
      totalMinutes += mins;

      if (!genreMap[log.genre]) {
        genreMap[log.genre] = { count: 0, total: 0 };
      }
      genreMap[log.genre].count += 1;
      genreMap[log.genre].total += mins;
    }

    const breakdown = Object.keys(genreMap).map((g) => ({
      genre: g,
      count: genreMap[g].count,
      total: genreMap[g].total,
    }));

    // Sắp xếp breakdown:
    // 1. total minutes descending
    // 2. equal totals: Fiction -> Non-Fiction -> Sci-Fi -> Biography -> Other
    breakdown.sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      const prioA = GENRE_PRIORITY[a.genre] ?? 99;
      const prioB = GENRE_PRIORITY[b.genre] ?? 99;
      return prioA - prioB;
    });

    return NextResponse.json(
      {
        count: logs.length,
        favoriteCount,
        totalMinutes,
        breakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}

