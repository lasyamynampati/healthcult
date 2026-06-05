"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  escalated?: boolean;
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const data = await apiFetch<{
        reply: string;
        escalated: boolean;
        disclaimer: string;
      }>("/api/v1/chat/", {
        method: "POST",
        body: JSON.stringify({ message: userMsg, context_type: "general" }),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply, escalated: data.escalated },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-lg flex-col" style={{ height: "70vh" }}>
        <h2 className="mb-2 text-lg font-semibold">
          Clinical Decision Support Chatbot
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          Guidance only — this assistant does not replace licensed medical
          professionals.
        </p>

        {!user && (
          <p className="mb-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800">
            Please log in to use the chatbot.
          </p>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded border bg-white p-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-slate-400">
              Start a conversation…
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-3 flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white"
                    : m.escalated
                    ? "border-2 border-red-300 bg-red-50 text-red-900"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.escalated && (
                  <span className="mb-1 block text-xs font-bold text-red-600">
                    ⚠ ESCALATED
                  </span>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-sm text-slate-400">Thinking…</p>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            disabled={!user || loading}
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={!user || loading || !input.trim()}
            className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </AppShell>
  );
}
