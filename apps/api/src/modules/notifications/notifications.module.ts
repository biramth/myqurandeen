import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { WebPushProvider } from "./web-push.provider";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, WebPushProvider],
  exports: [WebPushProvider],
})
export class NotificationsModule {}
