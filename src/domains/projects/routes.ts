import { NextRequest, NextResponse } from "next/server";
import { getProjects, getProjectById } from "./queries";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const project = await getProjectById(id);
    return NextResponse.json(project);
  }

  const status = searchParams.get("status") ?? undefined;
  const projects = await getProjects(status);
  return NextResponse.json(projects);
}
