import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { MarketingService } from "./marketing.service";
import { SendAnnouncementDto } from "./dto/send-announcement.dto";
import { UnsubscribeDto } from "./dto/unsubscribe.dto";

@ApiTags("marketing")
@Controller()
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  /**
   * Public et sans authentification : le lien est clique depuis un email par
   * quelqu'un qui n'a pas forcement de session active. La securite vient du
   * jeton signe (HMAC), pas d'un JWT.
   */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("marketing/unsubscribe")
  @HttpCode(HttpStatus.OK)
  unsubscribe(@Body() dto: UnsubscribeDto) {
    return this.marketingService.unsubscribe(dto.token);
  }

  /**
   * dryRun=true (defaut) : ne fait que compter les destinataires eligibles,
   * n'envoie rien - a utiliser pour verifier avant tout envoi reel.
   */
  @RequirePermission("marketing:send")
  @Post("admin/marketing/announcement")
  @HttpCode(HttpStatus.OK)
  sendAnnouncement(@Body() dto: SendAnnouncementDto) {
    return this.marketingService.sendAnnouncement({ dryRun: dto.dryRun, testEmail: dto.testEmail });
  }
}
