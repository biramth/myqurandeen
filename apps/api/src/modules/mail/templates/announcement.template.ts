import { BRAND, emailButton, emailLayout } from "./layout";

export interface AnnouncementEmailOptions {
  webUrl: string;
  displayName: string;
  /** Lien de desabonnement propre a ce destinataire (jeton signe, voir MarketingService). */
  unsubscribeUrl: string;
}

function benefit(emoji: string, title: string, text: string): string {
  return `<tr>
    <td style="padding:14px 16px;background:${BRAND.tint};border-radius:12px;">
      <p style="margin:0 0 4px;font-weight:600;color:${BRAND.primaryDark};">${emoji} ${title}</p>
      <p style="margin:0;font-size:14px;color:${BRAND.body};">${text}</p>
    </td>
  </tr>
  <tr><td style="height:10px;line-height:10px;font-size:0;">&nbsp;</td></tr>`;
}

/**
 * Email de campagne "nouvelle version" - ton commercial, pas technique (pas
 * de jargon type cache/compression/N+1), oriente benefices concrets pour
 * l'utilisateur. Comprend un volet partage (bouche a oreille) et un lien de
 * desabonnement obligatoire (email non-transactionnel).
 */
export function announcementEmailTemplate(options: AnnouncementEmailOptions): { subject: string; html: string } {
  const { webUrl, displayName, unsubscribeUrl } = options;
  const firstName = displayName.trim().split(/\s+/)[0] || "toi";

  const appUrl = `${webUrl}/?utm_source=email&utm_medium=campaign&utm_campaign=nouvelle_version`;
  const shareLink = `${webUrl}/?utm_source=email&utm_medium=share&utm_campaign=nouvelle_version`;
  const shareMessage =
    "Je découvre myQurandeen, une appli gratuite et open-source pour étudier le Coran, le hadith et l'histoire de l'Islam. À tester !";
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${shareLink}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareLink)}`;

  return {
    subject: "La nouvelle version de myQurandeen est arrivée ✨",
    html: emailLayout({
      webUrl,
      title: "La nouvelle version de myQurandeen est arrivée",
      preheader: "Plus rapide, installable sur ton téléphone, contenu encore plus soigné.",
      bodyHtml: `
        <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:#18181b;">Salam ${firstName} 👋</p>
        <p style="margin:0 0 20px;">On vient de mettre en ligne une nouvelle version de myQurandeen, et elle change vraiment l'expérience au quotidien :</p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:6px;">
          ${benefit("⚡", "Beaucoup plus rapide", "L'appli s'ouvre quasi instantanément, même quand tu y reviens plus tard dans la journée.")}
          ${benefit("📱", "Installable sur ton téléphone", "Ajoute myQurandeen à ton écran d'accueil et ouvre-la comme une vraie application, en un tap.")}
          ${benefit("📚", "Un contenu encore plus soigné", "Concepts, histoire de l'Islam, écoles de fiqh... relus et peaufinés de bout en bout, pour une lecture impeccable.")}
        </table>

        ${emailButton("Découvrir la nouvelle version", appUrl)}

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;border-top:1px solid ${BRAND.border};padding-top:20px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-weight:600;color:#18181b;">Fais-en profiter quelqu'un 💚</p>
              <p style="margin:0 0 14px;font-size:14px;color:${BRAND.body};">myQurandeen est gratuite et open-source : le meilleur coup de pouce, c'est que tu en parles autour de toi.</p>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-right:8px;padding-bottom:8px;">
                    <a href="${whatsappUrl}" style="display:inline-block;padding:10px 16px;background:#f4f4f5;border-radius:8px;font-size:13px;font-weight:600;color:#18181b;text-decoration:none;">Partager sur WhatsApp</a>
                  </td>
                  <td style="padding-bottom:8px;">
                    <a href="${twitterUrl}" style="display:inline-block;padding:10px 16px;background:#f4f4f5;border-radius:8px;font-size:13px;font-weight:600;color:#18181b;text-decoration:none;">Partager sur X</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
      footerHtml: `myQurandeen — plateforme open-source d'étude de l'Islam.<br />
        <a href="${unsubscribeUrl}" style="color:${BRAND.muted};text-decoration:underline;">Ne plus recevoir ces emails</a>`,
    }),
  };
}
