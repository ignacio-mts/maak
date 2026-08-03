"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_EVENT = "maak-theme-change";

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    mq.removeEventListener("change", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Server render (and first hydration pass) has no DOM: defer the real value to
// the client so markup matches and we avoid a hydration mismatch.
function getServerSnapshot(): Theme | null {
  return null;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Ignore storage failures (e.g. private mode); the toggle still applies.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-2 text-[12px] font-semibold text-[var(--ink-2)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
    >
      <span aria-hidden className="text-[14px] leading-none">
        {theme === null ? "" : isDark ? "☀" : "☾"}
      </span>
      <span className="tracking-tight">
        {theme === null ? "Tema" : isDark ? "Claro" : "Oscuro"}
      </span>
    </button>
  );
}
