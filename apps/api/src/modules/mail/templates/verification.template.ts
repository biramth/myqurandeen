import { emailButton, emailLayout } from "./layout";

/** Email transactionnel de confirmation d'adresse a l'inscription. */
export function verificationEmailTemplate(webUrl: string, verifyUrl: string): { subject: string; html: string } {
  return {
    subject: "Confirme ton adresse email",
    html: emailLayout({
      webUrl,
      title: "Confirme ton adresse email",
      preheader: "Un dernier clic pour activer ton compte myQurandeen.",
      bodyHtml: `
        <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:#18181b;">Bienvenue sur myQurandeen 👋</p>
        <p style="margin:0 0 4px;">Encore une petite étape avant de commencer : confirme ton adresse email.</p>
        ${emailButton("Confirmer mon adresse email", verifyUrl)}
        <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">Ce lien est valable 1 heure. Si tu n'es pas à l'origine de cette inscription, tu peux ignorer cet email sans risque.</p>
      `,
    }),
  };
}
