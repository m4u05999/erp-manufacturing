import { NextRequest, NextResponse } from "next/server";
import { getDrawings, getDrawingById } from "./queries";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) return NextResponse.json(await getDrawingById(id));

  const projectId = searchParams.get("projectId") ?? undefined;
  return NextResponse.json(await getDrawings(projectId));
}
