import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";

import type { Message } from "@/types/message";
import { generateResponse } from "@/services/chat.service";
import { generateConversationTitle } from "@/services/conversation-title.service";
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

    const isNewConversation = !conversationId;

    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title: userMessage.slice(0, 60),
        },
      });

      conversationId = conversation.id;
    }

    const savedConversationId = conversationId;

    await prisma.$transaction([
      prisma.message.createMany({
        data: [
          {
            conversationId: savedConversationId,
            role: "user",
            content: userMessage,
          },
          {
            conversationId: savedConversationId,
            role: "assistant",
            content: response,
          },
        ],
      }),
      prisma.conversation.update({
        where: { id: savedConversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    if (isNewConversation) {
      after(async () => {
        try {
          const title = await generateConversationTitle({
            userMessage,
            assistantResponse: response,
            language,
          });

          await prisma.conversation.updateMany({
            where: {
              id: savedConversationId,
              userId,
            },
            data: { title },
          });
        } catch (error) {
          console.error("Failed to generate conversation title:", error);
        }
      });
    }

    return Response.json({
      response,
      conversationId: savedConversationId,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
