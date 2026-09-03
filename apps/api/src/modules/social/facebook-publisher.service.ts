import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const GRAPH_API_VERSION = "v21.0";

/**
 * Publication sur une Page Facebook via l'API Graph. Plus simple que X : pas
 * d'OAuth 1.0a a signer, `POST /{page-id}/photos` accepte directement un
 * parametre `url` public (Facebook telecharge lui-meme l'image, pas besoin
 * d'envoyer les octets) - on lui passe donc directement l'URL de l'endpoint
 * `GET /og` deja public, sans regenerer l'image cote social. Desactive
 * silencieusement tant que les 2 cles ne sont pas fournies.
 */
@Injectable()
export class FacebookPublisherService {
  private readonly logger = new Logger(FacebookPublisherService.name);
  private readonly pageId: string | null;
  private readonly accessToken: string | null;
  readonly isConfigured: boolean;

  constructor(config: ConfigService) {
    const pageId = config.get<string>("FACEBOOK_PAGE_ID", "");
    const accessToken = config.get<string>("FACEBOOK_PAGE_ACCESS_TOKEN", "");
    this.isConfigured = Boolean(pageId && accessToken);
    this.pageId = this.isConfigured ? pageId : null;
    this.accessToken = this.isConfigured ? accessToken : null;
    if (!this.isConfigured) {
      this.logger.warn("FACEBOOK_PAGE_ID/FACEBOOK_PAGE_ACCESS_TOKEN absents - publication Facebook desactivee.");
    }
  }

  /** `imageUrl` doit etre publiquement accessible (Facebook la telecharge lui-meme). */
  async publish(imageUrl: string, caption: string): Promise<boolean> {
    if (!this.pageId || !this.accessToken) return false;
    try {
      const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${this.pageId}/photos`;
      const body = new URLSearchParams({ url: imageUrl, caption, access_token: this.accessToken });
      const res = await fetch(url, { method: "POST", body });
      if (!res.ok) throw new Error(`${res.status} : ${await res.text()}`);
      return true;
    } catch (error) {
      this.logger.error(`Echec de publication Facebook : ${(error as Error).message}`);
      return false;
    }
  }
}
