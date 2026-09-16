"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { Message } from "@/types/message";
import { sendChatMessage } from "@/lib/chat-api";

const suggestions = [
  "What's the best split for building muscle 4 days/week?",
  "How much protein do I actually need?",
  "How do I break through a deadlift plateau?",
  "What's a good beginner HIIT routine?",
  "Should I train fasted or fed for fat loss?",
  "How long should I rest between sets for hypertrophy?",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const conversationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [messages, loading, error]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    setError("");
    const userMessage: Message = { role: "user", content: message.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");

    try {
      const content = await sendChatMessage(updatedMessages);
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch (error) {
      console.error(error);
      setMessages(messages);
      setMessage(userMessage.content);
      setError("Couldn't reach your coach. Please try sending your message again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <main className="coach-app">
      <header className="app-header">
        <Link className="brand" href="/" aria-label="FitCoach AI home">
          <span className="brand-icon" aria-hidden="true">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6.5 6.5 11 11M4 9l5-5m6 16 5-5M2.5 6.5l4-4m11 19 4-4M4.5 4.5l3 3m9 9 3 3M9 9l6 6m-5-9 8 8M6 10l8 8" />
            </svg>
          </span>
          <span><span className="brand-name">FITCOACH AI</span><span className="brand-subtitle"><span className="status-dot" />ONLINE · YOUR FITNESS COACH</span></span>
        </Link>
        <span className="coach-status">{loading ? "COACH THINKING" : "COACH READY"}</span>
      </header>

      <div className="conversation" ref={conversationRef}>
        {messages.length === 0 ? (
          <section className="welcome">
            <div className="welcome-icon" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z" /></svg>
            </div>
            <h1>ASK ME ANYTHING FITNESS</h1>
            <p>Workouts · Nutrition · Recovery · Programming ·<br className="desktop-break" /> Supplements</p>
          </section>
        ) : (
          <div className="message-list" role="log" aria-label="Conversation with your coach" aria-live="polite">
            {messages.map((msg, index) => (
              <article key={index} className={`chat-message ${msg.role}`}>
                <span className="message-author">{msg.role === "user" ? "YOU" : "FITCOACH AI"}</span>
                <div className="message-content"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
              </article>
            ))}
            {loading && <p className="thinking" role="status"><span className="status-dot" />Your coach is thinking…</p>}
          </div>
        )}
      </div>

      <section className="suggestions" aria-label="Suggested questions">
        <button className="suggestions-toggle" type="button" aria-expanded={showSuggestions} aria-controls="suggested-questions" onClick={() => setShowSuggestions(!showSuggestions)}>
          SUGGESTED QUESTIONS <svg className={showSuggestions ? "" : "collapsed"} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {showSuggestions && <div className="suggestion-list" id="suggested-questions">
          {suggestions.map((suggestion) => <button type="button" key={suggestion} disabled={loading} onClick={() => { setMessage(suggestion); inputRef.current?.focus(); }}>{suggestion}</button>)}
        </div>}
      </section>

      <footer className="composer-area">
        {error && <p className="chat-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit} className="composer">
          <label htmlFor="message-input" className="sr-only">Ask your fitness coach</label>
          <textarea ref={inputRef} id="message-input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about workouts, nutrition, recovery..." rows={1} readOnly={loading} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }} />
          <button className="send-button" type="submit" disabled={loading || !message.trim()} aria-label="Send message" aria-busy={loading}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3" /></svg>
          </button>
        </form>
        <p className="keyboard-hint">SHIFT+ENTER FOR NEW LINE · ENTER TO SEND</p>
      </footer>
    </main>
  );
}
