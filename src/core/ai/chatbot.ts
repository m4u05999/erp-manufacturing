import { chatCompletionStream } from "./client";
import { CHATBOT_SYSTEM } from "./prompts";

export function createChatStream(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  return chatCompletionStream([{ role: "system", content: CHATBOT_SYSTEM }, ...messages]);
}
