import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, CloudDownload, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOfflineDownload } from "@/features/offline/useOfflineDownload";
import { useOnlineStatus } from "@/features/offline/useOnlineStatus";
import { quranApi } from "@/features/quran/api";
import { offlineDb } from "@/database/offline-db";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Ko";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
}

/**
 * Telechargement du texte complet du Coran pour la lecture hors-ligne.
 * Affiche directement sur la liste des sourates (`/quran`, le contenu
 * concerne), plutot que dans l'onglet "Hors ligne" du profil - retire suite
 * a une demande explicite : ce controle etait trop cache (necessitait
 * d'etre connecte puis de naviguer dans les reglages du profil) et doit
 * etre visible au niveau du contenu telechargeable lui-meme. Ne necessite
 * pas de compte (le telechargement est purement cote client, IndexedDB).
 *
 * Repris une seconde fois suite a un retour explicite ("pas joli") : la
 * premiere version affichait la liste des 8 traductions grande ouverte en
 * permanence, avant meme la liste des sourates - remplace par une carte
 * compacte (meme habillage que FridayBanner.tsx : icone + titre + bouton)
 * avec le choix des traductions replie par defaut.
 */
export function QuranOfflineDownloadCard() {
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
  const [pickerOpen, setPickerOpen] = React.useState(false);

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

  // Deja telecharge et rien en cours : carte compacte "etat" plutot que le
  // formulaire de telechargement.
  if (isQuranDownloaded && !busy) {
    return (
      <Card className="mb-6 border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t("offline.quranTextTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {downloadedTranslationIds.length > 0
                  ? t("offline.translationsDownloaded", { count: downloadedTranslationIds.length })
                  : t("offline.quranTextDescription")}
              </p>
              {needsUpdate && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{t("offline.updateAvailable")}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full shrink-0 sm:w-auto" onClick={() => void remove()}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("offline.remove")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/40 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CloudDownload className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t("offline.quranTextTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("offline.quranTextDescription")}</p>
            </div>
          </div>
          {!busy && (
            <Button type="button" className="w-full shrink-0 sm:w-auto" disabled={!online} onClick={() => void download(selected)}>
              {t("offline.download")}
            </Button>
          )}
        </div>

        {!online && <p className="mt-3 text-xs text-destructive">{t("offline.needConnection")}</p>}

        {busy && (
          <div className="mt-4">
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

        {!busy && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", pickerOpen && "rotate-180")} aria-hidden="true" />
              {t("offline.chooseTranslationsTitle")}
              {selected.length > 0 && ` (${selected.length})`}
            </button>

            {pickerOpen && (
              <div className="mt-2 rounded-md border bg-card">
                {translations && translations.length > 0 ? (
                  <div className="divide-y">
                    {translations.map((edition) => {
                      const active = selected.includes(edition.id);
                      const sizeLabel =
                        sizes && sizes.translationsBytes[edition.id]
                          ? formatBytes(sizes.translationsBytes[edition.id])
                          : "";
                      return (
                        <button
                          key={edition.id}
                          type="button"
                          onClick={() => toggle(edition.id)}
                          aria-pressed={active}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                                active ? "border-primary bg-primary text-primary-foreground" : "border-input",
                              )}
                            >
                              {active && <Check className="h-3 w-3" aria-hidden="true" />}
                            </span>
                            <span className="truncate">
                              {edition.name}
                              {edition.language ? ` (${edition.language})` : ""}
                            </span>
                          </span>
                          {sizeLabel && <span className="shrink-0 text-xs text-muted-foreground">{sizeLabel}</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="px-3 py-2 text-xs text-muted-foreground">{t("offline.noTranslations")}</p>
                )}
              </div>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              {t("offline.estimatedSize")}: <span className="font-medium tabular-nums">{formatBytes(estimatedBytes)}</span>
            </p>
          </div>
        )}

        {error && <p className="mt-2 text-xs text-destructive">{t(error)}</p>}
      </CardContent>
    </Card>
  );
}
