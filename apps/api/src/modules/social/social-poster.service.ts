import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { socialPosts } from "../../database/schema";
import { eq } from "drizzle-orm";
import { DailyService } from "../daily/daily.service";
import { OgService } from "../og/og.service";
import { TwitterPublisherService } from "./twitter-publisher.service";
import { FacebookPublisherService } from "./facebook-publisher.service";

type Platform = "twitter" | "facebook";

interface ChosenContent {
  type: "verse" | "hadith";
  ref: string;
  title: string;
  arabic?: string;
  transliteration?: string;
  body: string;
  source: string;
  path: string;
}

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function dayOfYearUtc(): number {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 1);
  return Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start) / 86_400_000);
}

/**
 * Publication automatique quotidienne du verset/hadith du jour sur X et
 * Facebook (roadmap 2.3) - alterne verset/hadith par parite du jour de
 * l'annee (UTC), en reutilisant tel quel `DailyService` : le contenu publie
 * est donc garanti identique a celui affiche ce jour-la sur la page
 * d'accueil, pas une selection separee.
 *
 * Meme schema de dedoublonnage que les autres planificateurs de
 * `reminders/`, mais via la contrainte unique `(platform, date_key)` de
 * `social_posts` plutot qu'un verrou consultatif Postgres : la ligne du jour
 * est d'abord "reservee" par un insert (`onConflictDoNothing`), et seulement
 * si la reservation reussit la publication reelle est tentee. Un echec de
 * publication libere la reservation (suppression de la ligne) pour permettre
 * une nouvelle tentative au tick suivant. Ce module reste independant de
 * `reminders/scheduler-lock.service.ts` (evite un import croise entre
 * modules) - la contrainte unique en base suffit ici, un seul type de tache
 * (une publication par jour et par plateforme) contre plusieurs types de
 * rappels par utilisateur pour les autres planificateurs.
 *
 * Chaque plateforme est independamment desactivee tant que ses cles ne sont
 * pas configurees (voir `TwitterPublisherService`/`FacebookPublisherService`)
 * - aucune erreur si aucune des deux n'est prete, le tick ne fait alors rien.
 * Instance Render gratuite : voir le meme commentaire que
 * `ReminderSchedulerService` (le `@Cron` interne ne suffit pas seul, ce
 * service est aussi declenche par `POST /reminders/run`, cf.
 * `scheduler-run.controller.ts`).
 */
@Injectable()
export class SocialPosterService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SocialPosterService.name);
  private readonly webUrl: string;

  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    config: ConfigService,
    private readonly dailyService: DailyService,
    private readonly ogService: OgService,
    private readonly twitter: TwitterPublisherService,
    private readonly facebook: FacebookPublisherService,
  ) {
    this.webUrl = config.get<string>("WEB_URL", "http://localhost:5173");
  }

  async onApplicationBootstrap() {
    await this.tick();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (!this.twitter.isConfigured && !this.facebook.isConfigured) return;
    try {
      await this.process();
    } catch (error) {
      this.logger.error(`Echec du tick de publication sociale : ${(error as Error).message}`);
    }
  }

  private async process() {
    const content = await this.chooseContent();
    if (!content) return; // base vide (environnement de test/demo sans contenu importe)

    const dateKey = new Date().toISOString().slice(0, 10);
    if (this.twitter.isConfigured) {
      await this.publishToPlatform("twitter", dateKey, content);
    }
    if (this.facebook.isConfigured) {
      await this.publishToPlatform("facebook", dateKey, content);
    }
  }

  private async chooseContent(): Promise<ChosenContent | null> {
    const useHadith = dayOfYearUtc() % 2 === 0;

    if (useHadith) {
      const hadith = await this.dailyService.getDailyHadith();
      if (!hadith) return null;
      return {
        type: "hadith",
        ref: `hadith:${hadith.id}`,
        title: `${hadith.collectionName} ${hadith.number}`,
        arabic: hadith.textArabic ?? undefined,
        body: hadith.textTranslation,
        source: hadith.collectionName,
        path: `/hadith/${hadith.collectionSlug}/${hadith.numberInCollection}`,
      };
    }

    const verse = await this.dailyService.getDailyVerse();
    if (!verse) return null;
    return {
      type: "verse",
      ref: `verse:${verse.id}`,
      title: `${verse.surahNameTransliterated} ${verse.numberInSurah}`,
      arabic: verse.textArabic,
      transliteration: verse.textTransliterated ?? undefined,
      body: verse.translation?.text ?? "",
      source: `${verse.surahNameTransliterated} — verset ${verse.numberInSurah}`,
      path: `/quran/${verse.surahNumber}/${verse.numberInSurah}`,
    };
  }

  private async publishToPlatform(platform: Platform, dateKey: string, content: ChosenContent) {
    const [reservation] = await this.db
      .insert(socialPosts)
      .values({ platform, dateKey, contentType: content.type, contentRef: content.ref })
      .onConflictDoNothing({ target: [socialPosts.platform, socialPosts.dateKey] })
      .returning({ id: socialPosts.id });
    if (!reservation) return; // deja publie (ou tente) aujourd'hui sur cette plateforme

    let success = false;
    try {
      success =
        platform === "twitter"
          ? await this.twitter.publish(await this.renderImage(content), this.buildCaption(content, platform, 250))
          : await this.facebook.publish(this.buildOgUrl(content), this.buildCaption(content, platform, 2000));
    } catch (error) {
      this.logger.error(`Echec de publication (${platform}) : ${(error as Error).message}`);
    }

    if (!success) {
      // Libere le creneau du jour pour permettre une nouvelle tentative au prochain tick.
      await this.db.delete(socialPosts).where(eq(socialPosts.id, reservation.id));
    }
  }

  private async renderImage(content: ChosenContent): Promise<Buffer> {
    return this.ogService.render({
      title: content.arabic ? undefined : content.title,
      arabic: content.arabic,
      transliteration: content.transliteration,
      body: content.body,
      source: content.source,
    });
  }

  /** Meme endpoint public que les cartes de partage du site (`GET /og`) - Facebook telecharge lui-meme l'image depuis cette URL. */
  private buildOgUrl(content: ChosenContent): string {
    const search = new URLSearchParams();
    if (!content.arabic && content.title) search.set("title", content.title);
    if (content.arabic) search.set("arabic", content.arabic);
    if (content.transliteration) search.set("transliteration", content.transliteration);
    if (content.body) search.set("body", content.body);
    if (content.source) search.set("source", content.source);
    return `${this.webUrl}/api/og?${search.toString()}`;
  }

  /** Meme convention UTM que `withShareUtm` (frontend) - `medium` = nom de la plateforme pour les distinguer dans les stats. */
  private buildShareUrl(path: string, medium: string): string {
    const url = new URL(path, this.webUrl);
    url.searchParams.set("utm_source", "share");
    url.searchParams.set("utm_medium", medium);
    url.searchParams.set("utm_campaign", "content_share");
    return url.toString();
  }

  private buildCaption(content: ChosenContent, platform: Platform, limit: number): string {
    const link = this.buildShareUrl(content.path, platform);
    const suffix = `\n\n— ${content.source}\n${link}`;
    const bodyBudget = Math.max(20, limit - suffix.length);
    return `${truncate(content.body, bodyBudget)}${suffix}`;
  }
}
