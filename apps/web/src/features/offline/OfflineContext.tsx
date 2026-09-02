import * as React from "react";
import { isOfflineQuranReady } from "@/features/quran/offline-quran";
import { useOnlineStatus } from "./useOnlineStatus";

interface OfflineContextValue {
  offline: boolean;
  quranReady: boolean;
  checkQuranReady: () => void;
}

const OfflineContext = React.createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const online = useOnlineStatus();
  const [quranReady, setQuranReady] = React.useState(false);

  const checkQuranReady = React.useCallback(() => {
    isOfflineQuranReady().then(setQuranReady).catch(() => setQuranReady(false));
  }, []);

  React.useEffect(() => {
    checkQuranReady();
  }, [checkQuranReady]);

  const value = React.useMemo<OfflineContextValue>(
    () => ({ offline: !online, quranReady, checkQuranReady }),
    [online, quranReady, checkQuranReady],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline(): OfflineContextValue {
  const ctx = React.useContext(OfflineContext);
  if (!ctx) throw new Error("useOffline doit etre utilise dans <OfflineProvider>");
  return ctx;
}
