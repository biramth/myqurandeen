/**
 * Habillage de marque commun a tous les emails (logo, carte blanche, pied de
 * page) - base sur des tables HTML pour rester compatible avec les webmails
 * les plus restrictifs (Outlook, Gmail...). Couleurs alignees sur la charte
 * de l'app (voir --primary dans apps/web/src/index.css et theme_color dans
 * apps/web/public/manifest.webmanifest) pour que les emails ressemblent
 * vraiment a myQurandeen plutot qu'a un gabarit generique.
 */

export const BRAND = {
  primary: "#1d726b",
  primaryDark: "#15544f",
  tint: "#eaf5f3",
  ink: "#18181b",
  body: "#3f3f46",
  muted: "#6b7280",
  border: "#e4e4e7",
} as const;

/** Bloc "carte" mis en avant (icone + titre + texte), reutilise par plusieurs emails. */
export function emailBenefit(emoji: string, title: string, text: string): string {
  return `<tr>
    <td style="padding:14px 16px;background:${BRAND.tint};border-radius:12px;">
      <p style="margin:0 0 4px;font-weight:600;color:${BRAND.primaryDark};">${emoji} ${title}</p>
      <p style="margin:0;font-size:14px;color:${BRAND.body};">${text}</p>
    </td>
  </tr>
  <tr><td style="height:10px;line-height:10px;font-size:0;">&nbsp;</td></tr>`;
}

/** Bouton d'action principal, identique sur tous les emails. */
export function emailButton(label: string, url: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:10px;background:${BRAND.primary};">
        <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export interface EmailLayoutOptions {
  /** Base de l'app (sans slash final) - sert au logo hebergé et au fil d'Ariane du pied de page. */
  webUrl: string;
  title: string;
  /** Texte d'apercu (preheader) affiche par les clients mail a cote de l'objet, invisible dans le corps. */
  preheader?: string;
  bodyHtml: string;
  /** Pied de page personnalise (ex. lien de desabonnement) - sinon un pied de page generique. */
  footerHtml?: string;
}

/** Emballe le contenu d'un email dans la mise en page de marque myQurandeen. */
export function emailLayout(options: EmailLayoutOptions): string {
  const { webUrl, title, preheader, bodyHtml, footerHtml } = options;
  const logoUrl = `${webUrl}/icon-192.png`;

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.ink};">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${preheader}</div>` : ""}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:10px;">
                      <img src="${logoUrl}" width="32" height="32" alt="myQurandeen" style="display:block;border-radius:8px;" />
                    </td>
                    <td style="vertical-align:middle;font-size:18px;font-weight:700;color:${BRAND.primaryDark};letter-spacing:-0.2px;">
                      myQurandeen
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(24,24,27,0.06);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:32px 28px;font-size:15px;line-height:1.65;color:${BRAND.body};">
                      ${bodyHtml}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 12px 0;font-size:12px;line-height:1.7;color:${BRAND.muted};">
                ${footerHtml ?? "myQurandeen — plateforme open-source d'étude du Coran, du hadith et de l'histoire de l'Islam."}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
