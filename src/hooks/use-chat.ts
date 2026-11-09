"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

import { useConversation } from "@/hooks/use-conversation";
import { useConversations } from "@/hooks/use-conversations";
import { sendChatMessage } from "@/lib/chat-api";
import type { ChatLanguage } from "@/lib/chat-copy";
import { useChatStore } from "@/stores/chat-store";
import type { Message } from "@/types/message";

export function useChat(language: ChatLanguage) {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [optimisticMessages, setOptimisticMessages] = useState<
    Message[] | null
  >(null);

  const [animatedMessageIndex, setAnimatedMessageIndex] = useState<
    number | null
  >(null);

  const { data: conversations } = useConversations();

  const { activeConversationId, setActiveConversationId } = useChatStore();

  const { data: selectedConversation, isPending: isConversationPending } =
    useConversation(activeConversationId);

  const savedMessages = useMemo<Message[]>(() => {
    return (
      selectedConversation?.messages.map(({ role, content }) => ({
        role: role as Message["role"],
        content,
      })) ?? []
    );
  }, [selectedConversation?.messages]);

  const displayedMessages =
    optimisticMessages ?? (activeConversationId ? savedMessages : messages);

  function handleNewChat() {
    setActiveConversationId(null);
    setOptimisticMessages(null);
    setMessages([]);
    setMessage("");
    setError(false);
    setAnimatedMessageIndex(null);
  }

  function handleSelectConversation(id: string) {
    setAnimatedMessageIndex(null);
    setOptimisticMessages(null);
    setError(false);
    setActiveConversationId(id);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!message.trim() || loading || isSignedIn === undefined) {
      return;
    }

    if (activeConversationId && !selectedConversation) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: message.trim(),
    };

    const currentConversationId = activeConversationId;
    const currentMessages = currentConversationId ? savedMessages : messages;

    const updatedMessages: Message[] = [...currentMessages, userMessage];

    setAnimatedMessageIndex(null);

    if (currentConversationId) {
      setOptimisticMessages(updatedMessages);
    } else {
      setMessages(updatedMessages);
    }

    setLoading(true);
    setError(false);
    setMessage("");

    try {
      const result = await sendChatMessage(
        userMessage.content,
        language,
        currentConversationId ?? undefined,
        isSignedIn ? undefined : currentMessages,
      );

      const completedMessages: Message[] = [
        ...updatedMessages,
        {
          role: "assistant",
          content: result.response,
        },
      ];

      setAnimatedMessageIndex(completedMessages.length - 1);

      if (result.conversationId) {
        queryClient.setQueryData(
          ["conversation", result.conversationId],
          (previous: typeof selectedConversation) => ({
            ...previous,
            id: result.conversationId,
            messages: completedMessages,
          }),
        );

        setActiveConversationId(result.conversationId);
        setOptimisticMessages(null);

        void queryClient.invalidateQueries({
          queryKey: ["conversation", result.conversationId],
        });
      } else {
        setMessages(completedMessages);
        setOptimisticMessages(null);
      }

      void queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    } catch (error) {
      console.error("Failed to send message:", error);

      setMessage(userMessage.content);
      setError(true);
      setAnimatedMessageIndex(null);

      if (currentConversationId) {
        setOptimisticMessages(null);
      } else {
        setMessages(currentMessages);
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    message,
    setMessage,
    loading,
    error,
    conversations: conversations ?? [],
    activeConversationId,
    isConversationPending,
    displayedMessages,
    animatedMessageIndex,
    handleNewChat,
    handleSelectConversation,
    handleSubmit,
  };
}
