import * as React from "react";

/**
 * Retourne `value`, mais avec un delai : la valeur ne change que si `value`
 * reste stable pendant `delayMs`. Sert a eviter une requete API a chaque
 * frappe clavier (ex. suggestions de recherche instantanees).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
