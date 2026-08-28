import { Controller, Get, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { AuditLogService } from "./audit-log.service";

@ApiTags("admin-audit-log")
@Controller("admin/audit-log")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @RequirePermission("audit_log:read")
  @Get()
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiQuery({ name: "entityType", required: false, type: String })
  @ApiQuery({ name: "action", required: false, type: String })
  list(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("entityType") entityType?: string,
    @Query("action") action?: string,
  ) {
    return this.auditLogService.list({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      entityType,
      action,
    });
  }
}
