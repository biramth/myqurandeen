import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { verificationEmailTemplate } from "./templates/verification.template";
import { resetPasswordEmailTemplate } from "./templates/reset-password.template";
import { announcementEmailTemplate, type AnnouncementEmailOptions } from "./templates/announcement.template";

/**
 * Fine couche autour de l'API transactionnelle Brevo (ex-Sendinblue) pour
 * l'envoi d'emails (verification email, reinitialisation de mot de passe,
 * campagnes). Brevo est utilise plutot que Resend car il ne demande de
 * verifier qu'une simple adresse email (clic sur un lien) et non un domaine
 * complet - utile tant que le projet n'a pas de nom de domaine a lui. Appel
 * direct en fetch (pas de SDK) : l'API est un simple POST JSON, inutile
 * d'ajouter une dependance pour ca. Tant que BREVO_API_KEY n'est pas
 * configuree, l'envoi est simule et journalise (logs) plutot que d'echouer,
 * meme principe que WebPushProvider : un deploiement sans cle ne doit pas
 * planter.
 *
 * La mise en forme (logo, couleurs de marque, structure) vit dans
 * ./templates/*.ts - ce service ne fait que router `to/subject/html` vers
 * Brevo et exposer les constructeurs de contenu aux autres modules.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly from: string;
  /** Base publique de l'app (sans slash final) - utilisee pour le logo hebergé et les liens des emails. */
  readonly webUrl: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>("BREVO_API_KEY", "");
    this.from = config.get<string>("EMAIL_FROM", "myqurandeen <no-reply@qurandeen.app>");
    this.webUrl = config.get<string>("WEB_URL", "http://localhost:5173").replace(/\/+$/, "");
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
    return verificationEmailTemplate(this.webUrl, verifyUrl);
  }

  buildResetEmail(resetUrl: string): { subject: string; html: string } {
    return resetPasswordEmailTemplate(this.webUrl, resetUrl);
  }

  buildAnnouncementEmail(options: Omit<AnnouncementEmailOptions, "webUrl">): { subject: string; html: string } {
    return announcementEmailTemplate({ webUrl: this.webUrl, ...options });
  }
}
