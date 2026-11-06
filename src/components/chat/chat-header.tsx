"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ChatCopy, ChatLanguage } from "@/lib/chat-copy";
import logo from "../../../public/logo.png";

type ChatHeaderProps = {
  text: ChatCopy;
  language: ChatLanguage;
  loading: boolean;
  onLanguageChange: (language: ChatLanguage) => void;
};

export function ChatHeader({
  text,
  language,
  loading,
  onLanguageChange,
}: ChatHeaderProps) {
  return (
    <header className="app-header">
      <Link className="brand" href="/" aria-label={text.home}>
        <span className="brand-icon" aria-hidden="true">
          <Image src={logo} alt="" sizes="43px" priority />
        </span>
        <span>
          <span className="brand-name">FITCOACH AI</span>
          <span className="brand-subtitle">
            <span className="status-dot" />
            {text.subtitle}
          </span>
        </span>
      </Link>
      <div className="header-controls">
        <Show when="signed-out">
          <SignInButton>
            <Button className="auth-button">
              {text.signIn}
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button className="auth-button auth-button-primary">
              {text.signUp}
            </Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
        <select
          className="language-select"
          aria-label={text.language}
          value={language}
          disabled={loading}
          onChange={(event) =>
            onLanguageChange(event.target.value === "es" ? "es" : "en")
          }
        >
          <option value="en" lang="en" aria-label="English">
            🇬🇧
          </option>
          <option value="es" lang="es" aria-label="Español">
            🇪🇸
          </option>
        </select>
      </div>
    </header>
  );
}
