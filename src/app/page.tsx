"use client";

import { useState } from "react";

import { Message } from "@/types/message";
import { sendChatMessage } from "@/lib/chat-api";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setMessage("");

    try {
      const content = await sendChatMessage(updatedMessages);

      const assistantMessage: Message = {
        role: "assistant",
        content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold">🏋️ Coach Agent</h1>

      <div className="flex-1 rounded-lg border p-4">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.role}:</strong> {msg.content}
          </p>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="rounded-lg border px-4 py-2 outline-none focus:ring-2"
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Send"}
      </button>
    </main>
  );
}