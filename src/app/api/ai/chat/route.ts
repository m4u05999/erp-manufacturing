import { NextRequest } from "next/server";
import { getSession } from "@/lib/get-session";
import { createChatStream } from "@/core/ai/chatbot";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { messages } = await request.json();
  if (!messages || !Array.isArray(messages)) {
    return new Response("Invalid messages", { status: 400 });
  }

  const stream = await createChatStream(messages);
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
