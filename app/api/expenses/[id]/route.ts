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
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const body = await req.json();
    const updateData: any = {};

    let candidateTitle = existingExpense.title;
    let candidateAmount = existingExpense.amount;
    let candidateSpentAt = existingExpense.spentAt;
    let checkDuplicate = false;

    if (body.title !== undefined) {
      const titleVal = validateTitle(body.title);
      if (titleVal.error) {
        return NextResponse.json({ error: titleVal.error }, { status: 400 });
      }
      candidateTitle = titleVal.value!;
      updateData.title = candidateTitle;
      checkDuplicate = true;
    }

    if (body.amount !== undefined) {
      const amountVal = validateAmount(body.amount);
      if (amountVal.error) {
        return NextResponse.json({ error: amountVal.error }, { status: 400 });
      }
      candidateAmount = amountVal.value!;
      updateData.amount = candidateAmount;
      checkDuplicate = true;
    }

    if (body.category !== undefined) {
      const categoryVal = validateCategory(body.category);
      if (categoryVal.error) {
        return NextResponse.json({ error: categoryVal.error }, { status: 400 });
      }
      updateData.category = categoryVal.value!;
    }

    if (body.spentAt !== undefined) {
      const spentAtVal = validateSpentAt(body.spentAt);
      if (spentAtVal.error) {
        return NextResponse.json({ error: spentAtVal.error }, { status: 400 });
      }
      candidateSpentAt = spentAtVal.value!;
      updateData.spentAt = candidateSpentAt;
      checkDuplicate = true;
    }

    if (body.note !== undefined) {
      updateData.note = typeof body.note === "string" ? body.note.trim() : "";
    }

    if (body.starred !== undefined) {
      updateData.starred = Boolean(body.starred);
    }

    // Duplicate check
    if (checkDuplicate) {
      const dup = await prisma.expense.findFirst({
        where: {
          userId: user.id,
          id: { not: existingExpense.id },
          title: candidateTitle,
          amount: candidateAmount,
          spentAt: candidateSpentAt,
        },
      });

      if (dup) {
        return NextResponse.json(
          { error: "Duplicate expense: an expense with the same title, amount and date already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.expense.update({
      where: { id: existingExpense.id },
      data: updateData,
    });

    return NextResponse.json(formatExpense(updated), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
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
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id: existingExpense.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}

