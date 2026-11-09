"use client";

import { useQuery } from "@tanstack/react-query";

export type Conversation = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

type ConversationsResponse = {
  conversations: Conversation[];
};

async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/conversations");

  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }

  const data: ConversationsResponse = await response.json();

  return data.conversations;
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    refetchInterval: 5000,
  });
}
