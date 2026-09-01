import { Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CronTokenGuard } from "../../common/guards/cron-token.guard";
import { DuaSchedulerService } from "./dua-scheduler.service";
import { ReminderSchedulerService } from "./reminder-scheduler.service";
import { StreakAlertSchedulerService } from "./streak-alert-scheduler.service";

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
  ) {}

  /** Declenche une passe complete des rappels, duas automatiques et alertes de serie. */
  @Public()
  @UseGuards(CronTokenGuard)
  @Post("run")
  @ApiOperation({ summary: "Declenche une passe complete des planificateurs de notifications (cron externe)" })
  async run() {
    await Promise.all([
      this.reminderScheduler.tick(),
      this.duaScheduler.tick(),
      this.streakAlertScheduler.tick(),
    ]);
    return {
      ok: true,
      tickedAt: new Date().toISOString(),
    };
  }
}
