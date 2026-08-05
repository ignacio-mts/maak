"use client";

import { useEffect, useSyncExternalStore } from "react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const THEME_EVENT = "maak-theme-change";
const STORAGE_KEY = "theme";
const ORDER: ThemePreference[] = ["light", "dark", "system"];

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // private mode
  }
  return "system";
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "light" || preference === "dark") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyResolved(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    mq.removeEventListener("change", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getSnapshot(): ThemePreference {
  return readPreference();
}

function getServerSnapshot(): ThemePreference {
  return "system";
}

const LABELS: Record<ThemePreference, string> = {
  light: "Tema claro",
  dark: "Tema oscuro",
  system: "Tema del sistema",
};

const NEXT_HINT: Record<ThemePreference, string> = {
  light: "Cambiar a tema oscuro",
  dark: "Cambiar a tema del sistema",
  system: "Cambiar a tema claro",
};

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm10 9a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM4 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm14.95 6.95a1 1 0 0 1-1.41 0l-.71-.7a1 1 0 1 1 1.41-1.42l.71.71a1 1 0 0 1 0 1.41ZM7.17 7.17a1 1 0 0 1-1.41 0l-.71-.71A1 1 0 0 1 6.46 3.75l.71.71a1 1 0 0 1 0 1.41Zm0 9.9-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 1.41Zm11.31-11.31-.71.71A1 1 0 1 1 16.36 5l.71-.71a1 1 0 0 1 1.41 1.41Z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
      <path
        fill="currentColor"
        d="M12.4 2.1a1 1 0 0 1 1.05.14 8 8 0 1 0 8.3 12.2 1 1 0 0 1 1.28-1.27A10 10 0 1 1 12.26 2a1 1 0 0 1 .14.1Z"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
      <path
        fill="currentColor"
        d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4.5l.4 1.5H15a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h1.1L10.5 17H6a2 2 0 0 1-2-2V5Zm2 0v8h12V5H6Z"
      />
    </svg>
  );
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === "dark") return <MoonIcon />;
  if (preference === "system") return <SystemIcon />;
  return <SunIcon />;
}

type ThemeToggleProps = {
  /** Tooltip placement relative to the icon button. */
  tooltipSide?: "top" | "bottom";
};

export function ThemeToggle({ tooltipSide = "top" }: ThemeToggleProps) {
  const preference = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    applyResolved(resolveTheme(preference));
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyResolved(resolveTheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  function cycle() {
    const idx = ORDER.indexOf(preference);
    const next = ORDER[(idx + 1) % ORDER.length];
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode
    }
    applyResolved(resolveTheme(next));
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  const label = LABELS[preference];
  const hint = NEXT_HINT[preference];
  const tipPos =
    tooltipSide === "bottom"
      ? "top-[calc(100%+6px)]"
      : "bottom-[calc(100%+6px)]";

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        onClick={cycle}
        aria-label={`${label}. ${hint}`}
        title={label}
        className="grid h-8 w-8 place-items-center rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--action)]"
      >
        <ThemeIcon preference={preference} />
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${tipPos} left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--line)] bg-[var(--ink)] px-2 py-1 text-[11px] font-medium text-[var(--bg)] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100`}
      >
        {label}
      </span>
    </div>
  );
}
