import * as React from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "qurandeen-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);

    // Aligne la couleur de la barre de statut/navigateur mobile sur le theme
    // actif - les meta `theme-color` statiques ne suivent que la preference
    // OS, pas le bouton de bascule manuel de l'app.
    const meta = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement | null;
    const color = theme === "dark" ? "#0f121a" : "#ffffff";
    if (meta) {
      meta.content = color;
    } else {
      const created = document.createElement("meta");
      created.name = "theme-color";
      created.content = color;
      document.head.appendChild(created);
    }
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = React.useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit etre utilise dans ThemeProvider");
  return ctx;
}
