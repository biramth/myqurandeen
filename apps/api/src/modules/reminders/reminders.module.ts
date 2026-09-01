import { Module } from "@nestjs/common";
import { CronTokenGuard } from "../../common/guards/cron-token.guard";
import { RemindersController } from "./reminders.controller";
import { SchedulerRunController } from "./scheduler-run.controller";
import { RemindersService } from "./reminders.service";
import { ReminderSchedulerService } from "./reminder-scheduler.service";
import { StreakAlertSchedulerService } from "./streak-alert-scheduler.service";
import { DuaSchedulerService } from "./dua-scheduler.service";
import { SchedulerLockService } from "./scheduler-lock.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [RemindersController, SchedulerRunController],
  providers: [
    RemindersService,
    ReminderSchedulerService,
    StreakAlertSchedulerService,
    DuaSchedulerService,
    SchedulerLockService,
    CronTokenGuard,
  ],
})
export class RemindersModule {}
