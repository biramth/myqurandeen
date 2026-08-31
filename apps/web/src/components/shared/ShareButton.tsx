import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { domToBlob } from "modern-screenshot";
import { Share2, Download, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ShareCard } from "./ShareCard";

export interface ShareContent {
  title: string;
  body?: string;
  arabicText?: string;
  source?: string;
  /** URL absolue (avec domaine) - utilisee pour le lien copie et le partage natif. */
  url: string;
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
 * la feuille de partage native OS) - voir ShareCard pour le rendu, et le
 * commentaire ci-dessus pour la course de chargement des polices.
 */
export function ShareButton({ content, size }: { content: ShareContent; size?: "default" | "sm" }) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [preparing, setPreparing] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const captureBlob = async (): Promise<Blob> => {
    if (!cardRef.current) throw new Error("Carte non prete");
    await ensureFontsLoaded();
    return domToBlob(cardRef.current, { width: 1080, height: 1920, scale: 3 });
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

        <div className="flex justify-center overflow-hidden rounded-xl shadow-lg">
          <ShareCard ref={cardRef} title={content.title} body={content.body} arabicText={content.arabicText} source={content.source} />
        </div>

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
          <div className="flex w-full gap-2">
            <Button type="button" variant="ghost" size="sm" className="flex-1" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                {t("share.whatsapp")}
              </a>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="flex-1" asChild>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                {t("share.twitter")}
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
