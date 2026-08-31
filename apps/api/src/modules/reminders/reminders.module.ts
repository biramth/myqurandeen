import { Module } from "@nestjs/common";
import { RemindersController } from "./reminders.controller";
import { RemindersService } from "./reminders.service";
import { ReminderSchedulerService } from "./reminder-scheduler.service";
import { StreakAlertSchedulerService } from "./streak-alert-scheduler.service";
import { DuaSchedulerService } from "./dua-scheduler.service";
import { SchedulerLockService } from "./scheduler-lock.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    ReminderSchedulerService,
    StreakAlertSchedulerService,
    DuaSchedulerService,
    SchedulerLockService,
  ],
})
export class RemindersModule {}
