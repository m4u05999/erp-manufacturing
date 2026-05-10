import { cookies } from "next/headers";
import type { Translations } from "./ar";
import ar from "./ar";
import en from "./en";

export async function getT(): Promise<Translations> {
  const cookieStore = await cookies();
  return cookieStore.get("locale")?.value === "en" ? en : ar;
}
