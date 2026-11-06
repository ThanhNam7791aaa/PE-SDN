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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const existingLog = await prisma.readingLog.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingLog) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 });
    }

    const body = await req.json();
    const updateData: any = {};

    let candidateTitle = existingLog.bookTitle;
    let candidateMinutes = existingLog.minutesRead;
    let candidateReadOn = existingLog.readOn;
    let checkDuplicate = false;

    if (body.bookTitle !== undefined) {
      const titleVal = validateBookTitle(body.bookTitle);
      if (titleVal.error) {
        return NextResponse.json({ error: titleVal.error }, { status: 400 });
      }
      candidateTitle = titleVal.value!;
      updateData.bookTitle = candidateTitle;
      checkDuplicate = true;
    }

    if (body.minutesRead !== undefined) {
      const minVal = validateMinutesRead(body.minutesRead);
      if (minVal.error) {
        return NextResponse.json({ error: minVal.error }, { status: 400 });
      }
      candidateMinutes = minVal.value!;
      updateData.minutesRead = candidateMinutes;
      checkDuplicate = true;
    }

    if (body.genre !== undefined) {
      const genreVal = validateGenre(body.genre);
      if (genreVal.error) {
        return NextResponse.json({ error: genreVal.error }, { status: 400 });
      }
      updateData.genre = genreVal.value!;
    }

    if (body.readOn !== undefined) {
      const readOnVal = validateReadOn(body.readOn);
      if (readOnVal.error) {
        return NextResponse.json({ error: readOnVal.error }, { status: 400 });
      }
      candidateReadOn = readOnVal.value!;
      updateData.readOn = candidateReadOn;
      checkDuplicate = true;
    }

    if (body.note !== undefined) {
      updateData.note = typeof body.note === "string" ? body.note.trim() : "";
    }

    if (body.favorite !== undefined) {
      updateData.favorite = Boolean(body.favorite);
    }

    // Duplicate check
    if (checkDuplicate) {
      const dup = await prisma.readingLog.findFirst({
        where: {
          userId: user.id,
          id: { not: existingLog.id },
          bookTitle: candidateTitle,
          minutesRead: candidateMinutes,
          readOn: candidateReadOn,
        },
      });

      if (dup) {
        return NextResponse.json(
          { error: "Duplicate reading session: a reading session with the same book title, minutes and date already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.readingLog.update({
      where: { id: existingLog.id },
      data: updateData,
    });

    return NextResponse.json(formatReadingLog(updated), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update reading log" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const existingLog = await prisma.readingLog.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingLog) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 });
    }

    await prisma.readingLog.delete({
      where: { id: existingLog.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete reading log" }, { status: 500 });
  }
}

