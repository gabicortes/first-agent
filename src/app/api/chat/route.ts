import { auth } from "@clerk/nextjs/server";
import { Message } from "@/types/message";
import { generateResponse } from "@/services/chat.service";
import { prisma } from "../../../../prisma";

type ChatRequest = {
  message: string;
  messages?: Message[];
  conversationId?: string;
  language?: "en" | "es";
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body: ChatRequest = await request.json();

    if (typeof body.message !== "string" || !body.message.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const userMessage = body.message.trim();
    const language = body.language === "en" ? "en" : "es";

    if (!userId) {
      const guestMessages = body.messages ?? [];

      const response = await generateResponse(
        [...guestMessages, { role: "user", content: userMessage }],
        null,
        language,
      );

      return Response.json({ response });
    }

    let conversationId = body.conversationId;
    let history: Message[] = [];

    if (conversationId) {
      // Verify ownership BEFORE invoking Gemini.
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!conversation) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }

      history = conversation.messages.map(({ role, content }) => ({
        role: role as Message["role"],
        content,
      }));
    }

    const response = await generateResponse(
      [...history, { role: "user", content: userMessage }],
      userId,
      language,
    );

    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title: userMessage.slice(0, 60),
        },
      });

      conversationId = conversation.id;
    }

    await prisma.$transaction([
      prisma.message.createMany({
        data: [
          {
            conversationId,
            role: "user",
            content: userMessage,
          },
          {
            conversationId,
            role: "assistant",
            content: response,
          },
        ],
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return Response.json({ response, conversationId });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
