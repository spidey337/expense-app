import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseReceipt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { image, mimeType } = body;

  if (!image || !mimeType) {
    return NextResponse.json(
      { error: "Image and mimeType are required" },
      { status: 400 }
    );
  }

  try {
    const parsed = await parseReceipt(image, mimeType);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Receipt parsing error:", error);
    let message: string;
    if (error instanceof Error) {
      message = typeof error.message === "string" ? error.message : JSON.stringify(error.message);
    } else {
      message = typeof error === "string" ? error : JSON.stringify(error);
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
