"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatView } from "@/components/chat/chat-view";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { ChatSidebar } from "@/components/chat/sidebar";

import { useChat } from "@/hooks/use-chat";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { chatCopy, type ChatLanguage } from "@/lib/chat-copy";

export default function Home() {
  const [language, setLanguage] = useState<ChatLanguage>("es");
  const text = chatCopy[language];

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    message,
    setMessage,
    loading,
    error,
    conversations,
    activeConversationId,
    isConversationPending,
    displayedMessages,
    animatedMessageIndex,
    handleNewChat,
    handleSelectConversation,
    handleSubmit,
    deletingConversationId,
    handleDeleteConversation,
  } = useChat(language);

  const { conversationRef, handleConversationScroll, resetAutoScroll } =
    useChatScroll(activeConversationId, displayedMessages.length, loading);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function onNewChat() {
    resetAutoScroll();
    handleNewChat();
  }

  function onSelectConversation(id: string) {
    resetAutoScroll();
    handleSelectConversation(id);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    resetAutoScroll();
    await handleSubmit(e);
    inputRef.current?.focus();
  }

  return (
    <div className="chat-layout">
      <ChatSidebar
        text={text}
        conversations={conversations}
        activeConversationId={activeConversationId}
        loading={loading}
        deletingConversationId={deletingConversationId}
        onSelectConversation={onSelectConversation}
        onNewChat={onNewChat}
        onDeleteConversation={handleDeleteConversation}
      />

      <main className="coach-app">
        <ChatHeader
          text={text}
          language={language}
          loading={loading}
          onLanguageChange={setLanguage}
        />

        <ChatView
          language={language}
          messages={displayedMessages}
          loading={loading}
          isConversationPending={isConversationPending}
          activeConversationId={activeConversationId}
          animatedMessageIndex={animatedMessageIndex}
          conversationRef={conversationRef}
          onScroll={handleConversationScroll}
        />

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
          onSubmit={onSubmit}
        />
      </main>
    </div>
  );
}
