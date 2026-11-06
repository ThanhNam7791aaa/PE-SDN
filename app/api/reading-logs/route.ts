import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  validateBookTitle,
  validateMinutesRead,
  validateGenre,
  validateReadOn,
  formatReadingLog,
} from "@/lib/reading-log-validation";

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
      orderBy: [
        { readOn: "desc" },
        { bookTitle: "asc" },
      ],
    });

    // Stable sort: ties broken by bookTitle, alphabetically, case-insensitive
    logs.sort((a, b) => {
      if (a.readOn !== b.readOn) {
        return a.readOn < b.readOn ? 1 : -1;
      }
      return a.bookTitle.localeCompare(b.bookTitle, undefined, { sensitivity: "base" });
    });

    return NextResponse.json(logs.map(formatReadingLog), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reading logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bookTitle, minutesRead, genre, note, readOn } = body;

    // Validation
    const titleVal = validateBookTitle(bookTitle);
    if (titleVal.error) {
      return NextResponse.json({ error: titleVal.error }, { status: 400 });
    }

    const minVal = validateMinutesRead(minutesRead);
    if (minVal.error) {
      return NextResponse.json({ error: minVal.error }, { status: 400 });
    }

    const genreVal = validateGenre(genre);
    if (genreVal.error) {
      return NextResponse.json({ error: genreVal.error }, { status: 400 });
    }

    const readOnVal = validateReadOn(readOn);
    if (readOnVal.error) {
      return NextResponse.json({ error: readOnVal.error }, { status: 400 });
    }

    const cleanTitle = titleVal.value!;
    const cleanMinutes = minVal.value!;
    const cleanGenre = genreVal.value!;
    const cleanReadOn = readOnVal.value!;
    const cleanNote = typeof note === "string" ? note.trim() : "";

    // Duplicate check
    const existing = await prisma.readingLog.findFirst({
      where: {
        userId: user.id,
        bookTitle: cleanTitle,
        minutesRead: cleanMinutes,
        readOn: cleanReadOn,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Duplicate reading session: a reading session with the same book title, minutes and date already exists" },
        { status: 409 }
      );
    }

    const created = await prisma.readingLog.create({
      data: {
        userId: user.id,
        bookTitle: cleanTitle,
        minutesRead: cleanMinutes,
        genre: cleanGenre,
        note: cleanNote,
        readOn: cleanReadOn,
        favorite: false,
      },
    });

    return NextResponse.json(formatReadingLog(created), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create reading log" }, { status: 500 });
  }
}

