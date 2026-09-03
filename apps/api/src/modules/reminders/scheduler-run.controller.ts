import { Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CronTokenGuard } from "../../common/guards/cron-token.guard";
import { DuaSchedulerService } from "./dua-scheduler.service";
import { ReminderSchedulerService } from "./reminder-scheduler.service";
import { StreakAlertSchedulerService } from "./streak-alert-scheduler.service";
import { PrayerAlertSchedulerService } from "./prayer-alert-scheduler.service";
import { SocialPosterService } from "../social/social-poster.service";

/**
 * Point d'entree du cron externe (cron-job.org, Render Cron Job, Github
 * Actions...) pour declencher manuellement les planificateurs de
 * notifications toute les minutes, independamment du @Cron interne.
 *
 * Pourquoi : l'API tourne sur le tier gratuit de Render, ou l'instance passe
 * en veille apres ~15 min sans trafic. Un @Cron(EVERY_MINUTE) ne s'execute
 * alors pas tant que le processus dort, donc les rappels programmes ne
 * partent jamais. Ce endpoint public (mais protege par un jeton partage via
 * Bearer) permet de forcer l'execution a chaque appel du cron externe : ce
 * sont les requetes HTTP du cron qui reveillent l'instance, pas l'inverse.
 *
 * Chaque planificateur reutilise son propre verrou consultatif Postgres et sa
 * fenetre de grace : appeler ce endpoint en plus du @Cron interne reste donc
 * sur, un envoi duplique dans la meme minute est evite par lastSentAt/dateKey.
 */
@ApiTags("reminders")
@ApiBearerAuth()
@Controller("reminders")
export class SchedulerRunController {
  constructor(
    private readonly reminderScheduler: ReminderSchedulerService,
    private readonly duaScheduler: DuaSchedulerService,
    private readonly streakAlertScheduler: StreakAlertSchedulerService,
    private readonly prayerAlertScheduler: PrayerAlertSchedulerService,
    private readonly socialPoster: SocialPosterService,
  ) {}

  /**
   * Declenche une passe complete des rappels, duas automatiques, alertes de
   * serie, alertes de priere et publications reseaux sociaux.
   *
   * Ne PAS `await` le travail : chaque `tick()` enchaîne des envois push
   * externes (Web Push, reseaux sociaux) qui peuvent prendre plusieurs
   * secondes, et le cron externe (cron-job.org) impose une fenetre courte
   * (~60 s). Si la requete attendait tout le travail, un pic d'utilisateurs
   * ou un service externe lent ferait echouer le cron (Timeout), devenant
   * meme la cause d'un delai en cascade. On lance le travail en arriere-plan
   * et on repond 204 immediatement.
   *
   * C'est sur malgre le retour immediat : chaque planificateur a son propre
   * verrou consultatif Postgres (pg_try_advisory_lock, non bloquant) et une
   * dedoublonnage (`lastSentAt`/`dateKey`) - un tick qui se chevauche ou
   * repasse saute simplement le travail deja fait. L'instance Render reste
   * eveillee par la requete du cron elle-meme, donc le travail en
   * arriere-plan se termine bien avant la prochaine sollicitation.
   */
  @Public()
  @UseGuards(CronTokenGuard)
  @Post("run")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Declenche une passe complete des planificateurs de notifications (cron externe)" })
  async run() {
    const jobs = [
      this.reminderScheduler.tick(),
      this.duaScheduler.tick(),
      this.streakAlertScheduler.tick(),
      this.prayerAlertScheduler.tick(),
      this.socialPoster.tick(),
    ];
    // Fire-and-forget : chaque tick() isole deja ses propres erreurs ; on ne
    // laisse aucun rejet echapper a la boucle d'evenements.
    for (const job of jobs) {
      job.catch(() => undefined);
    }
  }
}
