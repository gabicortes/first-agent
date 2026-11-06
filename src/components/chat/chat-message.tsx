import ReactMarkdown from "react-markdown";

import type { Message } from "@/types/message";

type ChatMessageProps = {
  message: Message;
  userLabel: string;
};

export function ChatMessage({ message, userLabel }: ChatMessageProps) {
  return (
    <article className={`chat-message ${message.role}`}>
      <span className="message-author">
        {message.role === "user" ? userLabel : "FITCOACH AI"}
      </span>
      <div className="message-content">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </article>
  );
}
