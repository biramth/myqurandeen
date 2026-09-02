import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Download, Info, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineDownload } from "@/features/offline/useOfflineDownload";
import { useOnlineStatus } from "@/features/offline/useOnlineStatus";
import { quranApi } from "@/features/quran/api";
import { offlineDb } from "@/database/offline-db";

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Ko";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
}

export function OfflineTab() {
  const { t } = useTranslation();
  const online = useOnlineStatus();
  const {
    isQuranDownloaded,
    downloadedTranslationIds,
    started,
    stage,
    progress,
    error,
    download,
    remove,
  } = useOfflineDownload();
  const [selected, setSelected] = React.useState<string[]>([]);

  // Editions de traduction disponibles + tailles estimees du cache hors-ligne.
  const { data: translations } = useQuery({
    queryKey: ["offline", "translations"],
    queryFn: quranApi.listTranslations,
    enabled: online,
  });
  const { data: sizes } = useQuery({
    queryKey: ["offline", "sizes"],
    queryFn: quranApi.exportOfflineSizes,
    enabled: online,
  });

  // Version serveur vs version en cache : signale un cache a rafraichir.
  const { data: serverVersion } = useQuery({
    queryKey: ["offline", "version"],
    queryFn: quranApi.exportVersion,
    enabled: online,
  });
  const [storedVersion, setStoredVersion] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!isQuranDownloaded) return;
    offlineDb.getQuranVersion().then(setStoredVersion).catch(() => undefined);
  }, [isQuranDownloaded]);
  const needsUpdate = isQuranDownloaded && serverVersion?.version && serverVersion.version !== storedVersion;

  const busy = started && (stage === "quran" || stage === "translations");

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const estimatedBytes =
    (sizes?.quranBytes ?? 0) +
    selected.reduce((sum, id) => sum + (sizes?.translationsBytes[id] ?? 0), 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("offline.description")}</p>

      {!online && <p className="text-xs text-destructive">{t("offline.needConnection")}</p>}
      {needsUpdate && <p className="text-xs text-amber-600 dark:text-amber-400">{t("offline.updateAvailable")}</p>}
      {isQuranDownloaded && !busy && downloadedTranslationIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t("offline.translationsDownloaded", { count: downloadedTranslationIds.length })}
        </p>
      )}

      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">{t("offline.quranTextTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("offline.quranTextDescription")}</p>
          </div>
          {isQuranDownloaded && !busy && (
            <Button variant="outline" size="sm" onClick={() => void remove()}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t("offline.remove")}
            </Button>
          )}
        </div>

        {!isQuranDownloaded && !busy && (
          <>
            <p className="mt-3 mb-1 text-xs font-medium text-muted-foreground">{t("offline.chooseTranslationsTitle")}</p>
            {translations && translations.length > 0 ? (
              <div className="mb-3 grid gap-1.5">
                {translations.map((edition) => {
                  const active = selected.includes(edition.id);
                  const sizeLabel =
                    sizes && sizes.translationsBytes[edition.id]
                      ? ` - ${formatBytes(sizes.translationsBytes[edition.id])}`
                      : "";
                  return (
                    <button
                      key={edition.id}
                      type="button"
                      onClick={() => toggle(edition.id)}
                      aria-pressed={active}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40"
                    >
                      <span className="truncate">
                        {edition.name}
                        {edition.language ? ` (${edition.language})` : ""}
                      </span>
                      <span className="ml-2 flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                        {sizeLabel}
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                            active ? "border-primary bg-primary text-primary-foreground" : "border-input"
                          }`}
                        >
                          {active ? "✓" : ""}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mb-3 text-xs text-muted-foreground">{t("offline.noTranslations")}</p>
            )}

            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {t("offline.estimatedSize")}: <span className="font-medium tabular-nums">{formatBytes(estimatedBytes)}</span>
              </span>
            </div>

            <Button type="button" disabled={!online} onClick={() => void download(selected)}>
              <Download className="h-4 w-4" aria-hidden="true" />
              {t("offline.download")}
            </Button>
          </>
        )}

        {busy && (
          <div className="mt-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{stage === "quran" ? t("offline.downloadingQuran") : t("offline.downloadingTranslations")}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(progress, 6)}%` }} />
            </div>
          </div>
        )}

        {stage === "done" && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{t("offline.done")}</p>}
        {error && <p className="mt-2 text-xs text-destructive">{t(error)}</p>}
      </div>
    </div>
  );
}
