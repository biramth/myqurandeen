import { useTranslation } from "react-i18next";
import { Download, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineDownload } from "@/features/offline/useOfflineDownload";
import { useOnlineStatus } from "@/features/offline/useOnlineStatus";

export function OfflineTab() {
  const { t } = useTranslation();
  const online = useOnlineStatus();
  const { isQuranDownloaded, started, stage, progress, error, download, remove } = useOfflineDownload();

  const busy = started && (stage === "quran" || stage === "translations");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("offline.description")}</p>

      {!online && <p className="text-xs text-destructive">{t("offline.needConnection")}</p>}

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
          <Button type="button" className="mt-3" disabled={!online} onClick={() => void download()}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {t("offline.download")}
          </Button>
        )}

        {busy && (
          <div className="mt-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{stage === "quran" ? t("offline.downloadingQuran") : t("offline.downloadingTranslations")}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.max(progress, 6)}%` }}
              />
            </div>
          </div>
        )}

        {stage === "done" && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{t("offline.done")}</p>}
        {error && <p className="mt-2 text-xs text-destructive">{t(error)}</p>}
      </div>
    </div>
  );
}
