import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { NextResponse } from "next/server";

export async function proxy(request: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);

  if (!session?.user && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
