import { Module } from "@nestjs/common";
import { CronTokenGuard } from "../../common/guards/cron-token.guard";
import { RemindersController } from "./reminders.controller";
import { SchedulerRunController } from "./scheduler-run.controller";
import { RemindersService } from "./reminders.service";
import { ReminderSchedulerService } from "./reminder-scheduler.service";
import { StreakAlertSchedulerService } from "./streak-alert-scheduler.service";
import { DuaSchedulerService } from "./dua-scheduler.service";
import { PrayerAlertSchedulerService } from "./prayer-alert-scheduler.service";
import { SchedulerLockService } from "./scheduler-lock.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { SocialModule } from "../social/social.module";

@Module({
  // SocialModule : le planificateur de publication reseaux sociaux
  // (SocialPosterService) n'a rien d'un "rappel", mais reutilise ici le
  // meme point d'entree externe (POST /reminders/run) plutot que de faire
  // configurer un second cron-job.org au projet - voir SchedulerRunController.
  imports: [NotificationsModule, SocialModule],
  controllers: [RemindersController, SchedulerRunController],
  providers: [
    RemindersService,
    ReminderSchedulerService,
    StreakAlertSchedulerService,
    DuaSchedulerService,
    PrayerAlertSchedulerService,
    SchedulerLockService,
    CronTokenGuard,
  ],
})
export class RemindersModule {}
