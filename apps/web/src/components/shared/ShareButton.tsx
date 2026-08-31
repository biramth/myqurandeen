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
  transliteration?: string;
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

  /**
   * Raccourci Instagram Stories : copie l'image dans le presse-papiers puis
   * ouvre le schema d'URL `instagram-stories://share`, qui reprend
   * automatiquement une image presente dans le presse-papiers systeme comme
   * fond de story (comportement iOS documente par Meta, deja utilise par
   * plusieurs sites - ex. le partage web de Spotify). Non officiel/non
   * garanti (aucune API publique equivalente) et fonctionne uniquement sur
   * iOS Safari avec Instagram installe - Android n'a pas d'equivalent web
   * fiable. `new ClipboardItem({ "image/png": blobPromise })` avec une
   * PROMESSE (pas un blob deja resolu) : ecrire dans le presse-papiers doit
   * rester synchrone dans le gestionnaire de clic pour garder l'autorisation
   * ("user activation") du navigateur - le blob, lui, peut arriver plus tard.
   */
  const handleInstagramStory = () => {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      toast.error(t("share.instagramUnsupported"));
      return;
    }
    setPreparing(true);
    const item = new ClipboardItem({ "image/png": captureBlob() });
    navigator.clipboard
      .write([item])
      .then(() => {
        const wasHidden = document.hidden;
        window.location.href = "instagram-stories://share";
        // Aucun moyen fiable de savoir si Instagram s'est reellement ouvert
        // (pas d'evenement pour un schema d'URL) : heuristique par delai -
        // si l'onglet n'a pas ete masque (l'app ne s'est pas mise au premier
        // plan) apres 1.5s, on suppose l'echec (pas installe, Android...) et
        // on previent plutot que de laisser un clic sans effet visible.
        window.setTimeout(() => {
          setPreparing(false);
          if (!document.hidden && !wasHidden) {
            toast.info(t("share.instagramFallbackHint"));
          }
        }, 1500);
      })
      .catch(() => {
        setPreparing(false);
        toast.error(t("share.error"));
      });
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
          <ShareCard
            ref={cardRef}
            title={content.title}
            body={content.body}
            arabicText={content.arabicText}
            transliteration={content.transliteration}
            source={content.source}
          />
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
          {/* Acces direct : evite de rouvrir la feuille de partage native et
              d'y rechercher l'app a chaque fois. WhatsApp/X ne transportent
              que le lien (limitation de plateforme, aucun moyen web de
              joindre un fichier a ces deux-la) ; Instagram tente de joindre
              la vraie image (voir handleInstagramStory) - d'ou le libelle
              distinct pour ne pas laisser croire que les trois se comportent pareil. */}
          <p className="pt-1 text-center text-xs text-muted-foreground">{t("share.shortcutsLabel")}</p>
          <div className="flex w-full gap-2">
            <Button type="button" variant="ghost" size="sm" className="flex-1" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                {t("share.whatsapp")}
              </a>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={handleInstagramStory} disabled={preparing}>
              {t("share.instagram")}
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
