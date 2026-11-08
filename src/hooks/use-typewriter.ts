"use client";

import { useEffect, useState } from "react";

export function useTypewriter(text: string, enabled = true, speed = 5) {
  const [visibleCount, setVisibleCount] = useState(enabled ? 0 : text.length);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setVisibleCount((count) => {
        if (count >= text.length) {
          clearInterval(interval);
          return count;
        }

        return Math.min(count + 3, text.length);
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text, enabled, speed]);

  return enabled ? text.slice(0, visibleCount) : text;
}
