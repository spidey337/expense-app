import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  expenses,
  expenseItems,
  expenseTags,
  tags,
  users,
} from "@/lib/db/schema";
import { eq, desc, and, gte, lte, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const tagIdsParam = searchParams.get("tagIds");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [eq(expenses.userId, session.user.id)];

  if (from) conditions.push(gte(expenses.date, new Date(from)));
  if (to) conditions.push(lte(expenses.date, new Date(to)));

  let expenseRows = await db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date));

  // If tag filter is applied, filter by expenses that have at least one matching tag
  if (tagIdsParam) {
    const filterTagIds = tagIdsParam.split(",");
    const matchingExpenseTags = await db
      .select({ expenseId: expenseTags.expenseId })
      .from(expenseTags)
      .where(inArray(expenseTags.tagId, filterTagIds));

    const matchingExpenseIds = new Set(
      matchingExpenseTags.map((et) => et.expenseId)
    );
    expenseRows = expenseRows.filter((e) => matchingExpenseIds.has(e.id));
  }

  // Fetch items and tags for all expenses
  const expenseIds = expenseRows.map((e) => e.id);

  if (expenseIds.length === 0) {
    return NextResponse.json([]);
  }

  const [items, eTags] = await Promise.all([
    db
      .select()
      .from(expenseItems)
      .where(inArray(expenseItems.expenseId, expenseIds)),
    db
      .select({
        expenseId: expenseTags.expenseId,
        tagId: tags.id,
        tagName: tags.name,
        tagColor: tags.color,
        tagIcon: tags.icon,
      })
      .from(expenseTags)
      .innerJoin(tags, eq(expenseTags.tagId, tags.id))
      .where(inArray(expenseTags.expenseId, expenseIds)),
  ]);

  const result = expenseRows.map((expense) => ({
    ...expense,
    date: expense.date.toISOString(),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
    items: items
      .filter((item) => item.expenseId === expense.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
      })),
    tags: eTags
      .filter((et) => et.expenseId === expense.id)
      .map((et) => ({
        id: et.tagId,
        name: et.tagName,
        color: et.tagColor,
        icon: et.tagIcon,
      })),
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { store, amount, date, notes, tagIds, items } = body;

  if (!store || !amount || !date) {
    return NextResponse.json(
      { error: "Store, amount, and date are required" },
      { status: 400 }
    );
  }

  // Create expense
  const [expense] = await db
    .insert(expenses)
    .values({
      userId: session.user.id,
      store,
      amount,
      date: new Date(date),
      notes: notes || null,
    })
    .returning();

  // Create sub-items
  if (items?.length) {
    const validItems = items.filter(
      (item: { name: string; amount: string }) =>
        item.name.trim() && item.amount
    );
    if (validItems.length) {
      await db.insert(expenseItems).values(
        validItems.map((item: { name: string; amount: string }) => ({
          expenseId: expense.id,
          name: item.name.trim(),
          amount: item.amount,
        }))
      );
    }
  }

  // Create tag associations
  if (tagIds?.length) {
    await db.insert(expenseTags).values(
      tagIds.map((tagId: string) => ({
        expenseId: expense.id,
        tagId,
      }))
    );
  }

  return NextResponse.json(expense, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // Verify ownership
  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, session.user.id)));

  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(expenses).where(eq(expenses.id, id));

  return NextResponse.json({ success: true });
}
