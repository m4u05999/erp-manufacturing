import { NextRequest, NextResponse } from "next/server";
import { getTickets, getTicketById } from "./queries";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) return NextResponse.json(await getTicketById(id));

  const status = searchParams.get("status") ?? undefined;
  return NextResponse.json(await getTickets(status));
}
