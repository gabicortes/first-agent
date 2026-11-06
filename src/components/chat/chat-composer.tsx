"use client";

import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FormEvent, Ref } from "react";

import { Button } from "@/components/ui/button";
import type { ChatCopy } from "@/lib/chat-copy";

type ChatComposerProps = {
  text: ChatCopy;
  message: string;
  loading: boolean;
  error: boolean;
  inputRef: Ref<HTMLTextAreaElement>;
  onMessageChange: (message: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChatComposer({
  text,
  message,
  loading,
  error,
  inputRef,
  onMessageChange,
  onSubmit,
}: ChatComposerProps) {
  return (
    <footer className="composer-area">
      {error && (
        <p className="chat-error" role="alert">
          {text.error}
        </p>
      )}
      <form onSubmit={onSubmit} className="composer">
        <label htmlFor="message-input" className="sr-only">
          {text.inputLabel}
        </label>
        <textarea
          ref={inputRef}
          id="message-input"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={text.placeholder}
          rows={1}
          readOnly={loading}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <Button
          className="send-button"
          type="submit"
          disabled={loading || !message.trim()}
          aria-label={text.send}
          aria-busy={loading}
        >
          <FontAwesomeIcon
            icon={faPaperPlane}
            style={{ width: 22, height: 22 }}
            aria-hidden="true"
          />
        </Button>
      </form>
      <p className="keyboard-hint">{text.hint}</p>
    </footer>
  );
}
