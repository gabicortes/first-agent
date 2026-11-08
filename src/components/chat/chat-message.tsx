import ReactMarkdown from "react-markdown";

import type { Message } from "@/types/message";
import { useTypewriter } from "@/hooks/use-typewriter";

type ChatMessageProps = {
  message: Message;
  userLabel: string;
  animate?: boolean;
};

export function ChatMessage({ message, userLabel, animate }: ChatMessageProps) {
  const displayedContent = useTypewriter(
    message.content,
    animate && message.role === "assistant",
    10,
  );
  return (
    <article className={`chat-message ${message.role}`}>
      <span className="message-author">
        {message.role === "user" ? userLabel : "FITCOACH AI"}
      </span>
      <div className="message-content">
        <ReactMarkdown>{displayedContent}</ReactMarkdown>
      </div>
    </article>
  );
}
