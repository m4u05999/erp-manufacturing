import { NextRequest, NextResponse } from "next/server";
import { getAttendanceRecords, getAttendanceById } from "./queries";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) return NextResponse.json(await getAttendanceById(id));

  const userId = searchParams.get("userId") ?? undefined;
  const date = searchParams.get("date") ?? undefined;
  return NextResponse.json(await getAttendanceRecords(userId, date));
}
