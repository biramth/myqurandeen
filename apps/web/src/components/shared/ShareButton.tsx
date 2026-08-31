import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { domToBlob } from "modern-screenshot";
import { Share2, Download, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

/** Ce que ShareButton lit lui-meme (partage natif, lien copie, raccourcis) - independant de la carte visuelle affichee. */
export interface ShareMeta {
  title: string;
  /** URL absolue (avec domaine) - utilisee pour le lien copie et le partage natif. */
  url: string;
}

/** Forme historique (carte de citation ShareCard) - ContentUserActions continue de l'utiliser telle quelle. */
export interface ShareContent extends ShareMeta {
  body?: string;
  arabicText?: string;
  transliteration?: string;
  source?: string;
}

/**
 * `document.fonts.ready` peut se resoudre avant que CHAQUE @font-face utilisee
 * ne soit reellement peinte - en particulier le sous-ensemble arabe charge via
 * un @font-face brut dans index.css (pas via @fontsource, donc pas
 * automatiquement suivi). Sans cette attente explicite, la capture DOM-vers-
 * image (modern-screenshot, technique foreignObject SVG) peut produire du
 * texte arabe invisible/tofu sur l'image generee.
 */
async function ensureFontsLoaded(): Promise<void> {
  try {
    await document.fonts.ready;
    await Promise.all([document.fonts.load("700 32px Amiri"), document.fonts.load("500 16px Inter")]);
  } catch {
    // Best-effort : on capture quand meme si la detection echoue.
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Bouton "Partager" façon Spotify (carte visuelle générée puis transmise à
 * la feuille de partage native OS) - le rendu de la carte elle-meme est
 * fourni par l'appelant via `renderCard` (ShareCard pour une citation de
 * contenu, StatShareCard pour une serie/un succes...), ce composant ne gere
 * que le dialogue/la capture/le partage - voir le commentaire plus haut pour
 * la course de chargement des polices (qui s'applique quelle que soit la carte).
 */
export function ShareButton({
  content,
  size,
  renderCard,
}: {
  content: ShareMeta;
  size?: "default" | "sm";
  renderCard: (ref: React.Ref<HTMLDivElement>) => React.ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [preparing, setPreparing] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const captureBlob = async (): Promise<Blob> => {
    if (!cardRef.current) throw new Error("Carte non prete");
    await ensureFontsLoaded();
    // IMPORTANT : ne jamais passer width/height ici. Ce ne sont pas des
    // dimensions de sortie mais des dimensions appliquees AU NOEUD avant le
    // rendu ("Width/Height in pixels to be applied to node before
    // rendering", doc modern-screenshot) - les passer (ex. 1080x1920) forcait
    // la carte (360x640 en CSS) a etre redimensionnee de force avant capture,
    // alors que son padding/texte restent en unites fixes (px/rem) : le
    // conteneur grossissait mais pas son contenu, produisant une image
    // visuellement cassee. `scale` seul augmente la resolution de sortie
    // sans toucher a la mise en page - c'est la bonne (et seule) option a
    // utiliser ici.
    return domToBlob(cardRef.current, { scale: 3 });
  };

  const handleShare = async () => {
    setPreparing(true);
    try {
      const blob = await captureBlob();
      const file = new File([blob], "myqurandeen.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        // Feuille de partage native (WhatsApp/Instagram/Messages...) avec
        // l'image jointe - l'effet "Spotify" recherche.
        await navigator.share({ files: [file], title: content.title, text: content.title, url: content.url });
      } else if (navigator.share) {
        // Support partiel (partage texte/URL sans fichier, ex. certains
        // navigateurs desktop) : mieux que rien plutot que de forcer un telechargement.
        await navigator.share({ title: content.title, text: content.title, url: content.url });
      } else {
        downloadBlob(blob, "myqurandeen.png");
      }
    } catch (error) {
      // AbortError = l'utilisateur a simplement ferme la feuille de partage.
      if ((error as Error)?.name !== "AbortError") {
        toast.error(t("share.error"));
      }
    } finally {
      setPreparing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(content.url);
      toast.success(t("share.linkCopied"));
    } catch {
      toast.error(t("share.error"));
    }
  };

  /** Un des raccourcis reseaux (WhatsApp/Instagram/X) : partage la VRAIE image,
   *  comme Spotify, et pas seulement un lien texte/URL.
   *
   *  - Mobile avec navigator.share+fichier : feuille de partage native avec la
   *    carte PNG jointe - l'utilisateur choisit l'app cible (WhatsApp, Instagram,
   *    X, Messages...). C'est l'effet recherche (image transmise, pas un lien).
   *  - Desktop sans partage de fichier : impossible d'attacher un fichier via un
   *    schema d'URL web, on copie donc l'image dans le presse-papiers puis on
   *    ouvre l'app en mode web (WhatsApp Web / X) pour que l'utilisateur la
   *    colle lui-meme - un lien seul partirait sans image. Pour Instagram
   *    (pas d'equivalent web) on ne copie que dans le presse-papiers avec un
   *    toast invitant a l'ouvrir.
   *  - Dernier recours (pas de clip.image du tout) : lien seul, mieux que rien.
   */
  const handleShortcutShare = async (platform: "whatsapp" | "instagram" | "twitter") => {
    setPreparing(true);
    try {
      const blob = await captureBlob();
      const file = new File([blob], "myqurandeen.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: content.title, text: content.title, url: content.url });
        return;
      }

      // Desktop : pas de partage de fichier - passer par le presse-papiers.
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.info(t("share.imageCopied"));
        if (platform === "instagram") {
          return;
        }
        const dest = platform === "whatsapp" ? whatsappUrl : twitterUrl;
        window.open(dest, "_blank", "noopener,noreferrer");
        return;
      }

      // Dernier recours : lien seul.
      const dest = platform === "whatsapp" ? whatsappUrl : twitterUrl;
      window.open(dest, "_blank", "noopener,noreferrer");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        toast.error(t("share.error"));
      }
    } finally {
      setPreparing(false);
    }
  };

  const shareMessage = `${content.title} ${content.url}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.title)}&url=${encodeURIComponent(content.url)}`;
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size={size === "sm" ? "sm" : "default"}>
          <Share2 className={size === "sm" ? "h-3.5 w-3.5" : "mr-1.5 h-4 w-4"} aria-hidden="true" />
          {size !== "sm" && t("share.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("share.dialogTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center overflow-hidden rounded-xl shadow-lg">{renderCard(cardRef)}</div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button type="button" onClick={handleShare} disabled={preparing} className="w-full">
            {preparing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : canNativeShare ? (
              <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
            ) : (
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {canNativeShare ? t("share.shareAction") : t("share.download")}
          </Button>
          <Button type="button" variant="outline" onClick={handleCopyLink} className="w-full">
            <Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("share.copyLink")}
          </Button>
          {/* Acces direct : partage la vraie image (feuille native sur mobile,
              presse-papiers + app web sur desktop) au lieu de rouvrir la feuille
              de partage depuis le bouton principal. Les trois raccourcis
              transmettent la carte PNG generee, pas seulement un lien. */}
          <p className="pt-1 text-center text-xs text-muted-foreground">{t("share.shortcutsLabel")}</p>
          <div className="flex w-full gap-2">
            <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => handleShortcutShare("whatsapp")} disabled={preparing}>
              {t("share.whatsapp")}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => handleShortcutShare("instagram")} disabled={preparing}>
              {t("share.instagram")}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => handleShortcutShare("twitter")} disabled={preparing}>
              {t("share.twitter")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
