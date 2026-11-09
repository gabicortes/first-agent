"use client";

import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessage } from "@/components/chat/chat-message";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { ChatSidebar } from "@/components/chat/sidebar";

import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useConversation } from "@/hooks/use-conversation";
import { useConversations } from "@/hooks/use-conversations";

import { sendChatMessage } from "@/lib/chat-api";
import { chatCopy, type ChatLanguage } from "@/lib/chat-copy";
import { useChatStore } from "@/stores/chat-store";
import type { Message } from "@/types/message";
import { ChatLoading } from "@/components/chat/chat-loading";

export default function Home() {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();

  // Language
  const [language, setLanguage] = useState<ChatLanguage>("es");
  const text = chatCopy[language];

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Optimistic messages
  const [optimisticMessages, setOptimisticMessages] = useState<
    Message[] | null
  >(null);

  // Typewriter animation
  const [animatedMessageIndex, setAnimatedMessageIndex] = useState<
    number | null
  >(null);

  // Composer ref
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Conversations
  const { data: conversations } = useConversations();

  const { activeConversationId, setActiveConversationId } = useChatStore();

  const { data: selectedConversation, isPending: isConversationPending } =
    useConversation(activeConversationId);

  // Saved conversation messages
  const savedMessages = useMemo<Message[]>(() => {
    return (
      selectedConversation?.messages.map(({ role, content }) => ({
        role: role as Message["role"],
        content,
      })) ?? []
    );
  }, [selectedConversation?.messages]);

  // Messages currently displayed
  const displayedMessages =
    optimisticMessages ?? (activeConversationId ? savedMessages : messages);

  // Scroll management
  const { conversationRef, handleConversationScroll, resetAutoScroll } =
    useChatScroll(activeConversationId, displayedMessages.length, loading);

  // Update document language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // --------------------------------------------------
  // CONVERSATION NAVIGATION
  // --------------------------------------------------

  const handleNewChat = () => {
    resetAutoScroll();

    setActiveConversationId(null);
    setOptimisticMessages(null);
    setMessages([]);
    setMessage("");
    setError(false);
    setAnimatedMessageIndex(null);
  };

  const handleSelectConversation = (id: string) => {
    resetAutoScroll();

    setAnimatedMessageIndex(null);
    setOptimisticMessages(null);
    setError(false);
    setActiveConversationId(id);
  };

  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

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

    // Follow the latest response.
    resetAutoScroll();

    // Reset the previous animation.
    setAnimatedMessageIndex(null);

    // Show the user message immediately.
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

      // Animate only the latest assistant response.
      setAnimatedMessageIndex(completedMessages.length - 1);

      if (result.conversationId) {
        // Immediately update React Query's cache.
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

        // Synchronize with the database in the background.
        void queryClient.invalidateQueries({
          queryKey: ["conversation", result.conversationId],
        });
      } else {
        // Guest chat: keep messages in local state.
        setMessages(completedMessages);
        setOptimisticMessages(null);
      }

      // Refresh the sidebar.
      void queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    } catch (error) {
      console.error("Failed to send message:", error);

      setMessage(userMessage.content);
      setError(true);
      setAnimatedMessageIndex(null);

      // Restore the previous state if the request fails.
      if (currentConversationId) {
        setOptimisticMessages(null);
      } else {
        setMessages(currentMessages);
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="chat-layout">
      <ChatSidebar
        conversations={conversations ?? []}
        activeConversationId={activeConversationId}
        loading={loading}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      <main className="coach-app">
        <ChatHeader
          text={text}
          language={language}
          loading={loading}
          onLanguageChange={setLanguage}
        />

        <div
          className="conversation"
          ref={conversationRef}
          onScroll={handleConversationScroll}
        >
          {activeConversationId && isConversationPending ? (
            <ChatLoading />
          ) : displayedMessages.length === 0 ? (
            <section className="welcome">
              <div className="welcome-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faBolt} />
              </div>

              <h1>{text.title}</h1>
              <p>{text.topics}</p>
            </section>
          ) : (
            <div
              className="message-list"
              role="log"
              aria-label={text.conversation}
              aria-live="polite"
            >
              {displayedMessages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg}
                  userLabel={text.you}
                  animate={
                    index === animatedMessageIndex && msg.role === "assistant"
                  }
                />
              ))}

              {loading && (
                <p className="thinking" role="status">
                  <span className="status-dot" />
                  {text.thinking}
                </p>
              )}
            </div>
          )}
        </div>

        <SuggestedQuestions
          text={text}
          loading={loading}
          onSelect={(suggestion) => {
            setMessage(suggestion);
            inputRef.current?.focus();
          }}
        />

        <ChatComposer
          text={text}
          message={message}
          loading={loading}
          error={error}
          inputRef={inputRef}
          onMessageChange={setMessage}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}
