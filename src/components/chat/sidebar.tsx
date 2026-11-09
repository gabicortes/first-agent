"use client";

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { ChatCopy } from "@/lib/chat-copy";

import type { Conversation } from "@/hooks/use-conversations";

type ChatSidebarProps = {
  text: ChatCopy;
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  deletingConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
};

export function ChatSidebar({
  text,
  conversations,
  activeConversationId,
  loading,
  deletingConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: ChatSidebarProps) {
  function handleDelete(id: string) {
    const confirmed = window.confirm(text.deleteConfirmation);

    if (confirmed) {
      onDeleteConversation(id);
    }
  }

  return (
    <aside className="chat-sidebar" aria-label={text.chatHistory}>
      <div className="sidebar-header">
        <h2>{text.conversations}</h2>

        <Button
          onClick={onNewChat}
          disabled={loading}
          className="sidebar-new-chat"
        >
          <span>{text.newChat}</span>
          <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
        </Button>
      </div>

      <nav className="sidebar-conversations" aria-label={text.savedConversations}>
        {conversations.length === 0 ? (
          <p className="sidebar-empty">{text.noConversations}</p>
        ) : (
          conversations.map((conversation) => {
            const isActive = activeConversationId === conversation.id;

            const isDeleting = deletingConversationId === conversation.id;

            return (
              <div
                key={conversation.id}
                className={`sidebar-conversation-row${isActive ? " active" : ""}`}
              >
                <Button
                  onClick={() => onSelectConversation(conversation.id)}
                  disabled={loading || isDeleting}
                  className={`sidebar-conversation ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  title={conversation.title ?? text.untitledConversation}
                >
                  <FontAwesomeIcon
                    icon={faComment}
                    className="sidebar-conversation-icon"
                    aria-hidden="true"
                  />
                  <span className="sidebar-conversation-title">
                    {conversation.title ?? text.untitledConversation}
                  </span>
                </Button>

                <Button
                  type="button"
                  className="sidebar-delete"
                  disabled={loading || deletingConversationId !== null}
                  onClick={() => handleDelete(conversation.id)}
                  aria-label={`${text.deleteConversation}: ${conversation.title ?? text.untitledConversation}`}
                  title={text.deleteConversation}
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
