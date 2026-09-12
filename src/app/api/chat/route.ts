import { Message } from "@/types/message";
import { generateResponse } from "@/services/chat.service";

type ChatRequest = {
  messages: Message[];
};

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();

    const response = await generateResponse(body.messages);

    return Response.json({
      response,
    });
  } catch (error) {
    console.error("Chat API error:", error);
  
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}