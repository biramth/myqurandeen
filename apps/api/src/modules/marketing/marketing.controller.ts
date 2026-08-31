import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { MarketingService } from "./marketing.service";
import { SendAnnouncementDto } from "./dto/send-announcement.dto";
import { UnsubscribeDto } from "./dto/unsubscribe.dto";
import { CreateMarketingGroupDto } from "./dto/create-marketing-group.dto";
import { AddGroupMembersDto } from "./dto/add-group-members.dto";

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

  /** Destinataires potentiels ("a qui j'envoie des mails"), avec recherche par email/nom. */
  @RequirePermission("marketing:send")
  @Get("admin/marketing/recipients")
  listRecipients(@Query("search") search?: string) {
    return this.marketingService.listRecipients(search);
  }

  /** Groupes de segmentation, avec nombre de membres. */
  @RequirePermission("marketing:send")
  @Get("admin/marketing/groups")
  listGroups() {
    return this.marketingService.listGroups();
  }

  @RequirePermission("marketing:send")
  @Post("admin/marketing/groups")
  createGroup(@Body() dto: CreateMarketingGroupDto) {
    return this.marketingService.createGroup(dto.name, dto.description);
  }

  /** Groupe + ses membres actuels (pour cocher les destinataires deja dedans). */
  @RequirePermission("marketing:send")
  @Get("admin/marketing/groups/:id")
  getGroup(@Param("id", ParseUUIDPipe) id: string) {
    return this.marketingService.getGroupWithMembers(id);
  }

  @RequirePermission("marketing:send")
  @Delete("admin/marketing/groups/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroup(@Param("id", ParseUUIDPipe) id: string) {
    await this.marketingService.deleteGroup(id);
  }

  @RequirePermission("marketing:send")
  @Post("admin/marketing/groups/:id/members")
  addGroupMembers(@Param("id", ParseUUIDPipe) id: string, @Body() dto: AddGroupMembersDto) {
    return this.marketingService.addGroupMembers(id, dto.userIds);
  }

  @RequirePermission("marketing:send")
  @Delete("admin/marketing/groups/:id/members/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeGroupMember(@Param("id", ParseUUIDPipe) id: string, @Param("userId", ParseUUIDPipe) userId: string) {
    await this.marketingService.removeGroupMember(id, userId);
  }

  /**
   * dryRun=true (defaut) : ne fait que compter les destinataires eligibles,
   * n'envoie rien - a utiliser pour verifier avant tout envoi reel.
   */
  @RequirePermission("marketing:send")
  @Post("admin/marketing/announcement")
  @HttpCode(HttpStatus.OK)
  sendAnnouncement(@Body() dto: SendAnnouncementDto) {
    return this.marketingService.sendAnnouncement({ dryRun: dto.dryRun, testEmail: dto.testEmail, groupId: dto.groupId });
  }
}
