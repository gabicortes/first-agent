import { Message } from "@/types/message";

export async function sendChatMessage(
  messages: Message[],
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json();
  
    console.error("API error:", error);
  
    throw new Error(error.error ?? "Failed to send message");
  }

  const data = await response.json();

  return data.response;
}