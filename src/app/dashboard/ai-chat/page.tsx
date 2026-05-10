"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/core/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatPage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحباً! أنا مساعد المصنع الذكي. كيف أقدر أساعدك اليوم؟\n\nHello! I'm the factory AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last.role === "assistant") {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...last, content: last.content + content };
                  return updated;
                }
                return prev;
              });
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: t.common.error }]);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col p-6 h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-semibold mb-4">{t.ai.chat}</h1>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
              msg.role === "user" ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700"
            }`}>
              {msg.content.split("\n").map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 border-t border-zinc-200 pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={t.ai.ask}
          className="flex-1 rounded-lg border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "..." : t.ai.send}
        </button>
      </div>
    </div>
  );
}
