"use client";

import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState, type FormEvent } from "react";

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

export default function Home() {
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

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [messages, loading, error]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!activeConversationId || !selectedConversation) return;

    setMessages(
      selectedConversation.messages.map(({ role, content }) => ({
        role: role as Message["role"],
        content,
      })),
    );
  }, [activeConversationId, selectedConversation]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(false);
    const userMessage: Message = { role: "user", content: message.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");

    try {
      const result = await sendChatMessage(
        updatedMessages,
        language,
        activeConversationId ?? undefined,
      );

      if (result.conversationId) {
        setActiveConversationId(result.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.response },
      ]);
    } catch (error) {
      console.error(error);
      setMessages(messages);
      setMessage(userMessage.content);
      setError(true);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <main className="coach-app">
      <ChatHeader
        text={text}
        language={language}
        loading={loading}
        onLanguageChange={setLanguage}
      />

      <div>
        <h3>Saved conversations</h3>

        {conversations?.map((conversation) => (
          <Button
            key={conversation.id}
            onClick={() => setActiveConversationId(conversation.id)}
          >
            {conversation.title ?? "Untitled conversation"}
          </Button>
        ))}

        {isConversationPending && activeConversationId && (
          <p>Loading conversation...</p>
        )}
      </div>

      <div className="conversation" ref={conversationRef}>
        {messages.length === 0 ? (
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
            {messages.map((msg, index) => (
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
  );
}
