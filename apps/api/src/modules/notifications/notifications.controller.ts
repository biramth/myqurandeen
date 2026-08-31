import { BadRequestException, Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { NotificationsService } from "./notifications.service";
import { SubscribePushDto } from "./dto/subscribe-push.dto";

@ApiTags("notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** Public : le frontend doit savoir si la fonctionnalite est configuree avant meme la connexion. */
  @Public()
  @Get("health")
  health() {
    return this.notificationsService.health();
  }

  @Get("subscribed")
  isSubscribed(@CurrentUser() user: RequestUser) {
    return this.notificationsService.isSubscribed(user.sub).then((subscribed) => ({ subscribed }));
  }

  @Post("subscribe")
  subscribe(@CurrentUser() user: RequestUser, @Body() dto: SubscribePushDto) {
    return this.notificationsService.subscribe(user.sub, dto);
  }

  @Delete("subscribe")
  unsubscribe(@CurrentUser() user: RequestUser, @Query("endpoint") endpoint: string) {
    if (!endpoint || !endpoint.trim()) {
      throw new BadRequestException("Le parametre 'endpoint' est requis.");
    }
    return this.notificationsService.unsubscribe(user.sub, endpoint);
  }

  @Delete("subscriptions")
  removeAll(@CurrentUser() user: RequestUser) {
    return this.notificationsService.removeAll(user.sub);
  }

  @Post("test")
  sendTest(@CurrentUser() user: RequestUser) {
    return this.notificationsService.sendTest(user.sub);
  }
}
