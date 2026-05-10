import { NextRequest, NextResponse } from "next/server";
import { getExpenses, getExpenseById } from "./queries";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) return NextResponse.json(await getExpenseById(id));

  const projectId = searchParams.get("projectId") ?? undefined;
  return NextResponse.json(await getExpenses(projectId));
}
