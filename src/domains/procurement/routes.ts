import { NextRequest, NextResponse } from "next/server";
import { getSuppliers, getPurchaseOrders, getInventory } from "./queries";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity");

  if (entity === "suppliers") {
    return NextResponse.json(await getSuppliers());
  }
  if (entity === "inventory") {
    const category = searchParams.get("category") ?? undefined;
    return NextResponse.json(await getInventory(category));
  }

  const status = searchParams.get("status") ?? undefined;
  return NextResponse.json(await getPurchaseOrders(status));
}
