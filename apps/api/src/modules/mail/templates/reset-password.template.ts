import { emailButton, emailLayout } from "./layout";

/** Email transactionnel de reinitialisation de mot de passe. */
export function resetPasswordEmailTemplate(webUrl: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Réinitialise ton mot de passe",
    html: emailLayout({
      webUrl,
      title: "Réinitialise ton mot de passe",
      preheader: "Choisis un nouveau mot de passe pour ton compte myQurandeen.",
      bodyHtml: `
        <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:#18181b;">Réinitialisation de mot de passe</p>
        <p style="margin:0 0 4px;">Une demande de réinitialisation a été faite pour ton compte myQurandeen.</p>
        ${emailButton("Choisir un nouveau mot de passe", resetUrl)}
        <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">Ce lien est valable 1 heure. Si tu n'es pas à l'origine de cette demande, ignore cet email : ton mot de passe reste inchangé.</p>
      `,
    }),
  };
}
