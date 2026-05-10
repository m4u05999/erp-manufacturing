import { NextRequest, NextResponse } from "next/server";
import { getLeads, getLeadById } from "./queries";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const lead = await getLeadById(id);
    return NextResponse.json(lead);
  }

  const stage = searchParams.get("stage") ?? undefined;
  const leads = await getLeads(stage);
  return NextResponse.json(leads);
}
