import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Clock, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { searchApi } from "@/features/search/api";
import { buildQuickResults } from "@/features/search/buildQuickResults";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchHistory } from "@/hooks/useSearchHistory";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  submitLabel?: string;
}

/**
 * Champ de recherche reutilisable (accueil + page /search) : recherches
 * recentes (localStorage, voir useSearchHistory) quand le champ est vide,
 * suggestions instantanees (debounce 300ms) des 2 caracteres tapes -
 * cliquer une suggestion navigue directement vers le contenu, cliquer une
 * recherche recente relance cette recherche. N'est pas un composant global
 * de navigation (pas dans l'en-tete) : uniquement attache aux champs de
 * recherche deja presents sur l'accueil et /search.
 */
export function SearchBox({ value, onChange, onSubmit, placeholder, autoFocus, className, submitLabel }: SearchBoxProps) {
  const { t } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const { history, add, remove, clear } = useSearchHistory();
  const debouncedValue = useDebouncedValue(value, 300);
  const trimmedDebounced = debouncedValue.trim();
  const suggestionsEnabled = isFocused && trimmedDebounced.length >= 2;

  const { data, isFetching } = useQuery({
    queryKey: ["search-suggestions", trimmedDebounced],
    queryFn: () => searchApi.search(trimmedDebounced),
    enabled: suggestionsEnabled,
    staleTime: 30_000,
  });

  const open = isFocused && (value.trim().length === 0 ? history.length > 0 : value.trim().length >= 2);
  const quickResults = data ? buildQuickResults(data) : [];

  const closeAndBlur = () => {
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const submit = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) add(trimmed);
    closeAndBlur();
    onSubmit(trimmed);
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submit(value);
  };

  const handleHistoryClick = (entry: string) => {
    onChange(entry);
    submit(entry);
  };

  return (
    <Popover open={open} onOpenChange={(next) => { if (!next) setIsFocused(false); }}>
      <PopoverAnchor asChild>
        <form onSubmit={handleFormSubmit} className={className ?? "flex gap-2"}>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              type="search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeAndBlur();
              }}
              placeholder={placeholder ?? t("home.searchPlaceholder")}
              aria-label={t("nav.search")}
              autoFocus={autoFocus}
              className="ps-9 pe-8"
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  inputRef.current?.focus();
                }}
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
                aria-label={t("common.cancel")}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <Button type="submit">{submitLabel ?? t("home.searchButton")}</Button>
        </form>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[26rem] max-w-[90vw] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[60vh] overflow-y-auto p-1.5">
          {value.trim().length === 0 && history.length > 0 && (
            <>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("search.recentSearches")}
                </span>
                <button
                  type="button"
                  onClick={clear}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  {t("search.clearHistory")}
                </button>
              </div>
              {history.map((entry) => (
                <div key={entry} className="group flex items-center rounded-md hover:bg-accent">
                  <button
                    type="button"
                    onClick={() => handleHistoryClick(entry)}
                    className="flex flex-1 items-center gap-2 px-2 py-1.5 text-start text-sm"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{entry}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(entry)}
                    className="me-1 shrink-0 rounded-sm p-1 text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
                    aria-label={t("common.cancel")}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </>
          )}

          {suggestionsEnabled && isFetching && quickResults.length === 0 && (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-accent/50" />
              ))}
            </div>
          )}

          {suggestionsEnabled && !isFetching && quickResults.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("search.noResults")}</p>
          )}

          {value.trim().length >= 2 &&
            quickResults.map((result) => (
              <Link
                key={result.key}
                to={result.href}
                onClick={() => {
                  add(value.trim());
                  closeAndBlur();
                }}
                className="block rounded-md px-3 py-2 hover:bg-accent"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium">{result.primary}</p>
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {t(result.badgeKey)}
                  </span>
                </div>
                {result.secondary && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{result.secondary}</p>
                )}
              </Link>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
