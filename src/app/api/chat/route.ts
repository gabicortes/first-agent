import { Message } from "@/types/message";
import { generateResponse } from "@/services/chat.service";

type ChatRequest = {
  messages: Message[];
  language?: "en" | "es";
};

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();

    if (body.language !== undefined && body.language !== "en" && body.language !== "es") {
      return Response.json({ error: "Unsupported language" }, { status: 400 });
    }

    const response = await generateResponse(body.messages, body.language);

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