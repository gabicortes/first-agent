"use client";

import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessage } from "@/components/chat/chat-message";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { useConversation } from "@/hooks/use-conversation";
import { useConversations } from "@/hooks/use-conversations";
import { sendChatMessage } from "@/lib/chat-api";
import { chatCopy, type ChatLanguage } from "@/lib/chat-copy";
import { useChatStore } from "@/stores/chat-store";
import type { Message } from "@/types/message";
import { ChatSidebar } from "@/components/chat/sidebar";

export default function Home() {
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState<ChatLanguage>("es");
  const text = chatCopy[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  const displayedMessages = activeConversationId ? savedMessages : messages;

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [displayedMessages, loading, error]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setMessage("");
    setError(false);
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!message.trim() || loading) return;
    if (activeConversationId && !selectedConversation) return;

    const userMessage: Message = {
      role: "user",
      content: message.trim(),
    };

    const currentConversationId = activeConversationId;

    const currentMessages = currentConversationId ? savedMessages : messages;

    const updatedMessages = [...currentMessages, userMessage];

    setLoading(true);
    setError(false);
    setMessage("");

    if (!currentConversationId) {
      setMessages(updatedMessages);
    }

    try {
      const result = await sendChatMessage(
        updatedMessages,
        language,
        currentConversationId ?? undefined,
      );

      if (result.conversationId) {
        await queryClient.invalidateQueries({
          queryKey: ["conversation", result.conversationId],
        });

        setActiveConversationId(result.conversationId);
      } else {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: result.response },
        ]);
      }

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    } catch (error) {
      console.error(error);
      setMessage(userMessage.content);
      setError(true);

      if (!currentConversationId) {
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
        onSelectConversation={setActiveConversationId}
        onNewChat={handleNewChat}
      />

      <main className="coach-app">
        <ChatHeader
          text={text}
          language={language}
          loading={loading}
          onLanguageChange={setLanguage}
        />
        <div className="conversation" ref={conversationRef}>
          {activeConversationId && isConversationPending ? (
            <p>Loading conversation...</p>
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
                <ChatMessage key={index} message={msg} userLabel={text.you} />
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
