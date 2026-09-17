"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faDumbbell } from "@fortawesome/free-solid-svg-icons";

import { Message } from "@/types/message";
import { sendChatMessage } from "@/lib/chat-api";

const copy = {
  en: {
    home: "FitCoach AI home",
    subtitle: "ONLINE · YOUR FITNESS COACH",
    title: "ASK ME ANYTHING FITNESS",
    topics: "Workouts · Nutrition · Recovery · Programming · Supplements",
    conversation: "Conversation with your coach",
    you: "YOU",
    thinking: "Your coach is thinking…",
    suggestionsLabel: "Suggested questions",
    suggestionsTitle: "SUGGESTED QUESTIONS",
    inputLabel: "Ask your fitness coach",
    placeholder: "Ask about workouts, nutrition, recovery...",
    send: "Send message",
    hint: "SHIFT+ENTER FOR NEW LINE · ENTER TO SEND",
    error: "Couldn't reach your coach. Please try sending your message again.",
    language: "Language",
    suggestions: [
      "What's the best split for building muscle 4 days/week?",
      "How much protein do I actually need?",
      "How do I break through a deadlift plateau?",
      "What's a good beginner HIIT routine?",
      "Should I train fasted or fed for fat loss?",
      "How long should I rest between sets for hypertrophy?",
    ],
  },
  es: {
    home: "Inicio de FitCoach AI",
    subtitle: "EN LÍNEA · TU ENTRENADOR PERSONAL",
    title: "PREGÚNTAME SOBRE ENTRENAMIENTO",
    topics: "Ejercicio · Nutrición · Recuperación · Planificación · Suplementos",
    conversation: "Conversación con tu entrenador",
    you: "TÚ",
    thinking: "Tu entrenador está pensando…",
    suggestionsLabel: "Preguntas sugeridas",
    suggestionsTitle: "PREGUNTAS SUGERIDAS",
    inputLabel: "Pregúntale a tu entrenador",
    placeholder: "Pregunta sobre ejercicio, nutrición, recuperación...",
    send: "Enviar mensaje",
    hint: "SHIFT+ENTER PARA UN SALTO DE LÍNEA · ENTER PARA ENVIAR",
    error: "No se pudo contactar a tu entrenador. Intenta enviar tu mensaje de nuevo.",
    language: "Idioma",
    suggestions: [
      "¿Cómo distribuyo mi entrenamiento para ganar músculo 4 días por semana?",
      "¿Cuánta proteína necesito realmente?",
      "¿Cómo supero un estancamiento en peso muerto?",
      "¿Cuál es una buena rutina de HIIT para principiantes?",
      "¿Debo entrenar en ayunas o después de comer para perder grasa?",
      "¿Cuánto debo descansar entre series para ganar masa muscular?",
    ],
  },
};

export default function Home() {
  const [language, setLanguage] = useState<"en" | "es">("es");
  const text = copy[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const conversationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [messages, loading, error]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(false);
    const userMessage: Message = { role: "user", content: message.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");

    try {
      const content = await sendChatMessage(updatedMessages, language);
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch (error) {
      console.error(error);
      setMessages(messages);
      setMessage(userMessage.content);
      setError(true);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <main className="coach-app">
      <header className="app-header">
        <Link className="brand" href="/" aria-label={text.home}>
          <span className="brand-icon" aria-hidden="true">
            <FontAwesomeIcon icon={faDumbbell} />
          </span>
          <span><span className="brand-name">FITCOACH AI</span><span className="brand-subtitle"><span className="status-dot" />{text.subtitle}</span></span>
        </Link>
        <div className="header-controls">
          <select className="language-select" aria-label={text.language} value={language} disabled={loading} onChange={(event) => setLanguage(event.target.value === "es" ? "es" : "en")}>
            <option value="en" lang="en" aria-label="English">🇬🇧</option>
            <option value="es" lang="es" aria-label="Español">🇪🇸</option>
          </select>
        </div>
      </header>

      <div className="conversation" ref={conversationRef}>
        {messages.length === 0 ? (
          <section className="welcome">
            <div className="welcome-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faBolt} />
            </div>
            <h1>{text.title}</h1>
            <p>{text.topics}</p>
          </section>
        ) : (
          <div className="message-list" role="log" aria-label={text.conversation} aria-live="polite">
            {messages.map((msg, index) => (
              <article key={index} className={`chat-message ${msg.role}`}>
                <span className="message-author">{msg.role === "user" ? text.you : "FITCOACH AI"}</span>
                <div className="message-content"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
              </article>
            ))}
            {loading && <p className="thinking" role="status"><span className="status-dot" />{text.thinking}</p>}
          </div>
        )}
      </div>

      <section className="suggestions" aria-label={text.suggestionsLabel}>
        <button className="suggestions-toggle" type="button" aria-expanded={showSuggestions} aria-controls="suggested-questions" onClick={() => setShowSuggestions(!showSuggestions)}>
          {text.suggestionsTitle} <svg className={showSuggestions ? "" : "collapsed"} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {showSuggestions && <div className="suggestion-list" id="suggested-questions">
          {text.suggestions.map((suggestion) => <button type="button" key={suggestion} disabled={loading} onClick={() => { setMessage(suggestion); inputRef.current?.focus(); }}>{suggestion}</button>)}
        </div>}
      </section>

      <footer className="composer-area">
        {error && <p className="chat-error" role="alert">{text.error}</p>}
        <form onSubmit={handleSubmit} className="composer">
          <label htmlFor="message-input" className="sr-only">{text.inputLabel}</label>
          <textarea ref={inputRef} id="message-input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={text.placeholder} rows={1} readOnly={loading} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }} />
          <button className="send-button" type="submit" disabled={loading || !message.trim()} aria-label={text.send} aria-busy={loading}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3" /></svg>
          </button>
        </form>
        <p className="keyboard-hint">{text.hint}</p>
      </footer>
    </main>
  );
}
