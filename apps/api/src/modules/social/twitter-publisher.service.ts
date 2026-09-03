import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { buildOAuth1Header, type OAuth1Credentials } from "./oauth1-signer";

const UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json";
const TWEET_URL = "https://api.twitter.com/2/tweets";

/**
 * Publication sur X (ex-Twitter) : upload de l'image (API v1.1, seule
 * disponible pour les medias meme via la v2) puis creation du tweet (API v2)
 * qui la reference. Desactive silencieusement tant que les 4 cles OAuth 1.0a
 * ne sont pas fournies - meme principe que `WebPushProvider`.
 */
@Injectable()
export class TwitterPublisherService {
  private readonly logger = new Logger(TwitterPublisherService.name);
  private readonly credentials: OAuth1Credentials | null;
  readonly isConfigured: boolean;

  constructor(config: ConfigService) {
    const consumerKey = config.get<string>("TWITTER_API_KEY", "");
    const consumerSecret = config.get<string>("TWITTER_API_SECRET", "");
    const accessToken = config.get<string>("TWITTER_ACCESS_TOKEN", "");
    const accessSecret = config.get<string>("TWITTER_ACCESS_SECRET", "");
    this.isConfigured = Boolean(consumerKey && consumerSecret && accessToken && accessSecret);
    this.credentials = this.isConfigured ? { consumerKey, consumerSecret, accessToken, accessSecret } : null;
    if (!this.isConfigured) {
      this.logger.warn(
        "TWITTER_API_KEY/TWITTER_API_SECRET/TWITTER_ACCESS_TOKEN/TWITTER_ACCESS_SECRET absents - publication X desactivee.",
      );
    }
  }

  /** Renvoie `true` en cas de succes, `false` sinon (jamais d'exception - l'appelant journalise juste l'echec). */
  async publish(imagePng: Buffer, text: string): Promise<boolean> {
    if (!this.credentials) return false;
    try {
      const mediaId = await this.uploadMedia(this.credentials, imagePng);
      await this.createTweet(this.credentials, text, mediaId);
      return true;
    } catch (error) {
      this.logger.error(`Echec de publication X : ${(error as Error).message}`);
      return false;
    }
  }

  /** Upload "simple" (non chunke, image < 5 Mo - largement suffisant pour une carte 1200x630 en PNG). */
  private async uploadMedia(credentials: OAuth1Credentials, imagePng: Buffer): Promise<string> {
    const authHeader = buildOAuth1Header("POST", UPLOAD_URL, credentials);
    const form = new FormData();
    // multipart/form-data : ce champ n'entre pas dans la signature OAuth (voir oauth1-signer.ts).
    form.append("media_data", imagePng.toString("base64"));
    const res = await fetch(UPLOAD_URL, { method: "POST", headers: { Authorization: authHeader }, body: form });
    if (!res.ok) throw new Error(`media/upload ${res.status} : ${await res.text()}`);
    const data = (await res.json()) as { media_id_string: string };
    return data.media_id_string;
  }

  private async createTweet(credentials: OAuth1Credentials, text: string, mediaId: string): Promise<void> {
    const authHeader = buildOAuth1Header("POST", TWEET_URL, credentials);
    const res = await fetch(TWEET_URL, {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ text, media: { media_ids: [mediaId] } }),
    });
    if (!res.ok) throw new Error(`tweets ${res.status} : ${await res.text()}`);
  }
}
