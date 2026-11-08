import type { Message } from "@/types/message";

type ChatResponse = {
  response: string;
  conversationId?: string;
};

export async function sendChatMessage(
  message: string,
  language: "en" | "es" = "es",
  conversationId?: string,
  guestHistory?: Message[],
): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      language,
      conversationId,
      messages: guestHistory,
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    console.error("API error:", error);

    throw new Error(error.error ?? "Failed to send message");
  }

  return response.json();
}
