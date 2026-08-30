import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Fine couche autour de l'API transactionnelle Brevo (ex-Sendinblue) pour
 * l'envoi d'emails (verification email, reinitialisation de mot de passe).
 * Brevo est utilise plutot que Resend car il ne demande de verifier qu'une
 * simple adresse email (clic sur un lien) et non un domaine complet - utile
 * tant que le projet n'a pas de nom de domaine a lui. Appel direct en fetch
 * (pas de SDK) : l'API est un simple POST JSON, inutile d'ajouter une
 * dependance pour ca. Tant que BREVO_API_KEY n'est pas configuree, l'envoi
 * est simule et journalise (logs) plutot que d'echouer, meme principe que
 * WebPushProvider : un deploiement sans cle ne doit pas planter.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>("BREVO_API_KEY", "");
    this.from = config.get<string>("EMAIL_FROM", "myqurandeen <no-reply@qurandeen.app>");
    if (!this.apiKey) {
      this.logger.warn("BREVO_API_KEY absente - les emails sont simules et journalises.");
    }
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.apiKey) {
      // Mode simule : on ne stocke pas le contenu des emails (ils peuvent
      // contenir des secrets), on loggue juste la cible et l'objet.
      this.logger.log(`[SIMULATION EMAIL] A -> ${to} | ${subject}`);
      return;
    }

    const { name, email } = this.parseFrom(this.from);
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify({
        sender: { name, email },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      this.logger.error(`Echec d'envoi email a ${to} (${subject}) : ${response.status} ${body}`);
      throw new Error("Echec de l'envoi d'email");
    }
  }

  /** Parse le format "Nom <email@domaine>" (accepte aussi une adresse seule). */
  private parseFrom(from: string): { name: string; email: string } {
    const match = from.match(/^([^<]*)<([^>]+)>$/);
    if (match) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: "myqurandeen", email: from.trim() };
  }

  buildVerificationEmail(verifyUrl: string): { subject: string; html: string } {
    return {
      subject: "Confirme ton adresse email",
      html: this.layout(
        "Confirme ton adresse email",
        `<p>Bienvenue sur myQurandeen !</p>
         <p>Pour activer ton compte, confirme ton adresse email en cliquant sur le lien ci-dessous :</p>
         <p><a href="${verifyUrl}">Confirmer mon adresse email</a></p>
         <p>Ce lien est valable 1 heure. Si tu n'es pas a l'origine de cette inscription, ignore cet email.</p>`,
      ),
    };
  }

  buildResetEmail(resetUrl: string): { subject: string; html: string } {
    return {
      subject: "Reinitialise ton mot de passe",
      html: this.layout(
        "Reinitialise ton mot de passe",
        `<p>Une demande de reinitialisation de mot de passe a ete faite pour ton compte myQurandeen.</p>
         <p>Clique sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
         <p><a href="${resetUrl}">Reinitialiser mon mot de passe</a></p>
         <p>Ce lien est valable 1 heure. Si tu n'es pas a l'origine de cette demande, ignore cet email (ton mot de passe reste inchange).</p>`,
      ),
    };
  }

  private layout(title: string, bodyHtml: string): string {
    return `<!DOCTYPE html>
      <html lang="fr">
        <head><meta charset="utf-8" /><title>${title}</title></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px;">
            <tr><td align="center">
              <table role="presentation" width="100%" style="max-width:420px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <tr><td style="padding:28px 24px 8px;">
                  <div style="font-size:20px;font-weight:600;color:#10b981;margin-bottom:16px;">myQurandeen</div>
                </td></tr>
                <tr><td style="padding:8px 24px 24px;font-size:15px;line-height:1.6;color:#3f3f46;">
                  ${bodyHtml}
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>`;
  }
}
