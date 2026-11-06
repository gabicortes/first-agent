import { auth } from "@clerk/nextjs/server";
import { Message } from "@/types/message";
import { generateResponse } from "@/services/chat.service";
import { prisma } from "../../../../prisma";

type ChatRequest = {
  messages: Message[];
  conversationId?: string;
  language?: "en" | "es";
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body: ChatRequest = await request.json();

    const response = await generateResponse(
      body.messages,
      userId,
      body.language,
    );

    if (!userId) {
      return Response.json({ response });
    }

    const latestMessage = body.messages.at(-1);

    if (!latestMessage || latestMessage.role !== "user") {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }

    let conversationId = body.conversationId;

    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
      });

      if (!conversation) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }
    } else {
      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title: latestMessage.content.slice(0, 60),
        },
      });

      conversationId = conversation.id;
    }

    await prisma.message.createMany({
      data: [
        {
          conversationId,
          role: "user",
          content: latestMessage.content,
        },
        {
          conversationId,
          role: "assistant",
          content: response,
        },
      ],
    });

    return Response.json({ response, conversationId });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
