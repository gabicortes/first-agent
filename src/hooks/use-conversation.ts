"use client";

import { useQuery } from "@tanstack/react-query";
import type { Message } from "@/types/message";

type SavedConversation = {
  id: string;
  title: string | null;
  messages: Message[];
};

async function fetchConversation(id: string): Promise<SavedConversation> {
  const response = await fetch(`/api/conversations/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch conversation");
  }

  const data = await response.json();

  return data.conversation;
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
  });
}
