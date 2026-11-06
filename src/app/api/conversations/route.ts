import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ conversations });
}
