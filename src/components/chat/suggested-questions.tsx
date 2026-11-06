"use client";

import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ChatCopy } from "@/lib/chat-copy";

type SuggestedQuestionsProps = {
  text: ChatCopy;
  loading: boolean;
  onSelect: (suggestion: string) => void;
};

export function SuggestedQuestions({
  text,
  loading,
  onSelect,
}: SuggestedQuestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);

  return (
    <section className="suggestions" aria-label={text.suggestionsLabel}>
      <Button
        className="suggestions-toggle"
        aria-expanded={showSuggestions}
        aria-controls="suggested-questions"
        onClick={() => setShowSuggestions((visible) => !visible)}
      >
        {text.suggestionsTitle}{" "}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={showSuggestions ? "" : "collapsed"}
          style={{ width: 12, height: 12 }}
          aria-hidden="true"
        />
      </Button>
      {showSuggestions && (
        <div className="suggestion-list" id="suggested-questions">
          {text.suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              disabled={loading}
              onClick={() => onSelect(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
