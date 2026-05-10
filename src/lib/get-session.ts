import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";

export function getSession() {
  return getServerSession(authOptions);
}
