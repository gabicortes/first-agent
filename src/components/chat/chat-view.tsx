"use client";

import { memo, type RefObject } from "react";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ChatLoading } from "@/components/chat/chat-loading";
import { ChatMessage } from "@/components/chat/chat-message";

import type { Message } from "@/types/message";
import { chatCopy, type ChatLanguage } from "@/lib/chat-copy";

type ChatViewProps = {
  language: ChatLanguage;
  messages: Message[];
  loading: boolean;
  isConversationPending: boolean;
  activeConversationId: string | null;
  animatedMessageIndex: number | null;
  conversationRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
};

export const ChatView = memo(function ChatView({
  language,
  messages,
  loading,
  isConversationPending,
  activeConversationId,
  animatedMessageIndex,
  conversationRef,
  onScroll,
}: ChatViewProps) {
  const text = chatCopy[language];

  return (
    <div className="conversation" ref={conversationRef} onScroll={onScroll}>
      {activeConversationId && isConversationPending ? (
        <ChatLoading />
      ) : messages.length === 0 ? (
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
  );
});
