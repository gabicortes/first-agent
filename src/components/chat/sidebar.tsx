"use client";

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import type { Conversation } from "@/hooks/use-conversations";

type ChatSidebarProps = {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  deletingConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
};

export function ChatSidebar({
  conversations,
  activeConversationId,
  loading,
  deletingConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: ChatSidebarProps) {
  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation? This action cannot be undone.",
    );

    if (confirmed) {
      onDeleteConversation(id);
    }
  }

  return (
    <aside className="chat-sidebar" aria-label="Chat history">
      <div className="sidebar-header">
        <h2>Conversations</h2>

        <Button
          onClick={onNewChat}
          disabled={loading}
          className="sidebar-new-chat"
        >
          <b>+ New Chat</b>
        </Button>
      </div>

      <nav className="sidebar-conversations" aria-label="Saved conversations">
        {conversations.length === 0 ? (
          <p className="sidebar-empty">No conversations yet</p>
        ) : (
          conversations.map((conversation) => {
            const isActive = activeConversationId === conversation.id;

            const isDeleting = deletingConversationId === conversation.id;

            return (
              <div key={conversation.id} className="sidebar-conversation-row">
                <Button
                  onClick={() => onSelectConversation(conversation.id)}
                  disabled={loading || isDeleting}
                  className={`sidebar-conversation ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  title={conversation.title ?? "Untitled conversation"}
                >
                  {conversation.title ?? "Untitled conversation"}
                </Button>

                <Button
                  type="button"
                  className="sidebar-delete"
                  disabled={loading || deletingConversationId !== null}
                  onClick={() => handleDelete(conversation.id)}
                  aria-label={`Delete ${conversation.title ?? "conversation"}`}
                  title="Delete conversation"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
