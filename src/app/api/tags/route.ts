import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const allTags = await db.select().from(tags).orderBy(asc(tags.name));
  return NextResponse.json(allTags);
}
