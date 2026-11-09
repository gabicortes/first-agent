"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

export function useChatScroll(
  conversationId: string | null,
  messagesCount: number,
  loading: boolean,
) {
  const conversationRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    const conversation = conversationRef.current;

    if (!conversation) return;

    conversation.scrollTop = conversation.scrollHeight;
  }, []);

  const handleConversationScroll = useCallback(() => {
    const conversation = conversationRef.current;

    if (!conversation) return;

    const distanceFromBottom =
      conversation.scrollHeight -
      conversation.scrollTop -
      conversation.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 100;
  }, []);

  useLayoutEffect(() => {
    const conversation = conversationRef.current;

    if (!conversation) return;

    const content = conversation.firstElementChild;

    if (!content) return;

    const observer = new ResizeObserver(() => {
      if (shouldAutoScrollRef.current) {
        scrollToBottom();
      }
    });

    observer.observe(content);

    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }

    return () => observer.disconnect();
  }, [conversationId, messagesCount, scrollToBottom]);

  useLayoutEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [messagesCount, loading, scrollToBottom]);

  const resetAutoScroll = useCallback(() => {
    shouldAutoScrollRef.current = true;
  }, []);

  return {
    conversationRef,
    handleConversationScroll,
    resetAutoScroll,
  };
}
