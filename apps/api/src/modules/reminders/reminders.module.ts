import { Module } from "@nestjs/common";
import { RemindersController } from "./reminders.controller";
import { RemindersService } from "./reminders.service";
import { ReminderSchedulerService } from "./reminder-scheduler.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [RemindersController],
  providers: [RemindersService, ReminderSchedulerService],
})
export class RemindersModule {}
