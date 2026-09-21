import { auth } from "@clerk/nextjs/server";

import { Message } from "@/types/message";
import { generateResponse } from "@/services/chat.service";

type ChatRequest = {
  messages: Message[];
  language?: "en" | "es";
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body: ChatRequest = await request.json();

    const response = await generateResponse(
      body.messages,
      userId,
      body.language,
    );

    return Response.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}