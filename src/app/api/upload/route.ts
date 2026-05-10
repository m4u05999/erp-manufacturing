import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { uploadFile } from "@/core/storage/minio";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(buffer, file.name, file.type);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("Upload failed:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
