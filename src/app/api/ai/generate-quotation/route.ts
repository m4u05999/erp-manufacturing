import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { generateQuotation } from "@/core/ai/quotation";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = await generateQuotation(body);
  if (!result) return NextResponse.json({ error: "AI generation failed" }, { status: 500 });

  return NextResponse.json(result);
}
