"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerInsertedHTML } from "next/navigation";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
export type ThemeMode = Theme | "system";

const DEFAULT_STORAGE_KEY = "theme";
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function getSystemTheme(): Theme {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}

function resolveTheme(mode: ThemeMode, system: Theme): Theme {
  return mode === "system" ? system : mode;
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove(...THEMES);
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

function disableTransitions() {
  const style = document.createElement("style");
  style.textContent =
    "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
  document.head.appendChild(style);
  window.getComputedStyle(document.body);
  setTimeout(() => {
    document.head.removeChild(style);
  }, 1);
}

interface ThemeContextValue {
  theme: ThemeMode | undefined;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: Theme | undefined;
  systemTheme: Theme | undefined;
  themes: readonly ThemeMode[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = DEFAULT_STORAGE_KEY,
  disableTransitionOnChange = false,
}: {
  readonly children: ReactNode;
  readonly defaultTheme?: ThemeMode;
  readonly storageKey?: string;
  readonly disableTransitionOnChange?: boolean;
}) {
  const [mode, setMode] = useState<ThemeMode>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<Theme>("light");

  useServerInsertedHTML(() => (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var e=document.documentElement;var t=localStorage.getItem("${storageKey}")||"${defaultTheme}";var s=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var r=t==="system"?s:t;e.classList.remove("light","dark");e.classList.add(r);e.style.colorScheme=r}catch(x){}})();`,
      }}
    />
  ));

  useEffect(() => {
    const media = window.matchMedia(COLOR_SCHEME_QUERY);
    const onMediaChange = () => setSystemTheme(getSystemTheme());
    onMediaChange();
    media.addEventListener("change", onMediaChange);
    return () => media.removeEventListener("change", onMediaChange);
  }, []);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(storageKey);
    } catch {
      // storage unavailable — ignore
    }
    const nextMode: ThemeMode =
      stored === "light" || stored === "dark" ? stored : defaultTheme;
    setMode(nextMode);
    setSystemTheme(getSystemTheme());
    applyThemeToDocument(resolveTheme(nextMode, getSystemTheme()));
  }, [storageKey, defaultTheme]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      const system = getSystemTheme();
      const nextResolved = resolveTheme(next, system);
      applyThemeToDocument(nextResolved);
      if (disableTransitionOnChange) {
        disableTransitions();
      }
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // storage unavailable — ignore
      }
      setMode(next);
    },
    [disableTransitionOnChange, storageKey],
  );

  const resolvedTheme = useMemo(
    () => resolveTheme(mode, systemTheme),
    [mode, systemTheme],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: mode,
      setTheme,
      resolvedTheme,
      systemTheme,
      themes: [...THEMES, "system"] as const,
    }),
    [mode, setTheme, resolvedTheme, systemTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
