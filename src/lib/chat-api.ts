import { Message } from "@/types/message";

type ChatResponse = {
  response: string;
  conversationId?: string;
};

export async function sendChatMessage(
  messages: Message[],
  language: "en" | "es",
  conversationId?: string,
): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      language,
      conversationId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}
