"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { Message } from "@/types/message";
import { sendChatMessage } from "@/lib/chat-api";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim() || loading) return;

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
    <main className="mx-auto flex min-h-screen w-2xl max-w-full flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold">🏋️ Coach Agent</h1>

      <div className="flex-1 overflow-hidden rounded-lg border p-4">
        {messages.map((msg, index) => (
          <p key={index} className="wrap-break-word">
            <strong>
              {msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:
            </strong>{" "}
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="message-input" className="sr-only">
          Message
        </label>
        <input
          id="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          aria-disabled={loading}
          className="rounded-lg border px-4 py-2 outline-none focus:ring-2 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          aria-label="Send message"
          aria-busy={loading}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </main>
  );
}