"use client";

import { Button } from "@/components/ui/button";
import type { Conversation } from "@/hooks/use-conversations";

type ChatSidebarProps = {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
};

export function ChatSidebar({
  conversations,
  activeConversationId,
  loading,
  onSelectConversation,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <aside className="chat-sidebar" aria-label="Chat history">
      <div className="sidebar-header">
        <h2>Conversations</h2>

        <Button
          onClick={onNewChat}
          disabled={loading}
          className="sidebar-new-chat"
        >
          + New Chat
        </Button>
      </div>

      <nav className="sidebar-conversations" aria-label="Saved conversations">
        {conversations.length === 0 ? (
          <p className="sidebar-empty">No conversations yet</p>
        ) : (
          conversations.map((conversation) => (
            <Button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              disabled={loading}
              className={`sidebar-conversation ${
                activeConversationId === conversation.id ? "active" : ""
              }`}
              aria-current={
                activeConversationId === conversation.id ? "page" : undefined
              }
              title={conversation.title ?? "Untitled conversation"}
            >
              {conversation.title ?? "Untitled conversation"}
            </Button>
          ))
        )}
      </nav>
    </aside>
  );
}
