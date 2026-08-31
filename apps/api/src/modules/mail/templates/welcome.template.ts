import { emailBenefit, emailButton, emailLayout } from "./layout";

/**
 * Email transactionnel envoye une seule fois, a la toute premiere
 * verification d'un compte (mot de passe : clic sur le lien de verification ;
 * Google : compte cree directement verifie) - voir AuthService.verifyEmail
 * et AuthService.issueTokensForUser. Distinct des campagnes marketing : il ne
 * depend pas de marketingOptOut (lie a la creation du compte, pas a une
 * campagne) et n'a donc pas de lien de desabonnement.
 */
export function welcomeEmailTemplate(webUrl: string, displayName: string): { subject: string; html: string } {
  const firstName = displayName.trim().split(/\s+/)[0] || "toi";
  const appUrl = `${webUrl}/?utm_source=email&utm_medium=transactional&utm_campaign=bienvenue`;

  return {
    subject: "Bienvenue sur myQurandeen 🌙",
    html: emailLayout({
      webUrl,
      title: "Bienvenue sur myQurandeen",
      preheader: "Ton compte est prêt : Coran, hadith et histoire de l'Islam, à ton rythme.",
      bodyHtml: `
        <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:#18181b;">Salam ${firstName}, bienvenue 👋</p>
        <p style="margin:0 0 20px;">Ton compte myQurandeen est vérifié et prêt à l'emploi. Voici de quoi bien démarrer :</p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:6px;">
          ${emailBenefit("📖", "Étudie à ton rythme", "Coran, hadith, concepts et histoire de l'Islam, organisés pour progresser sans te perdre.")}
          ${emailBenefit("🔥", "Garde ta série", "Des rappels doux pour garder une lecture régulière, jour après jour.")}
          ${emailBenefit("📱", "Installable sur ton téléphone", "Ajoute myQurandeen à ton écran d'accueil pour l'ouvrir comme une vraie application.")}
        </table>

        ${emailButton("Ouvrir myQurandeen", appUrl)}
      `,
    }),
  };
}
