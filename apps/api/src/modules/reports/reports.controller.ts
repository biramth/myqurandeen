import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { ReportsService } from "./reports.service";
import { AssignReportDto } from "./dto/assign-report.dto";
import { UpdateReportStatusDto } from "./dto/update-report-status.dto";

@ApiTags("admin-reports")
@Controller("admin/reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @RequirePermission("report:view")
  @Get()
  listReports() {
    return this.reportsService.listReports();
  }

  @RequirePermission("report:view")
  @Get(":id/history")
  getHistory(@Param("id") id: string) {
    return this.reportsService.getHistory(id);
  }

  @RequirePermission("report:assign")
  @Patch(":id/assign")
  assignReport(@Param("id") id: string, @Body() dto: AssignReportDto, @CurrentUser() user: RequestUser) {
    return this.reportsService.assignReport(id, dto.moderatorId, user.sub);
  }

  @RequirePermission("report:resolve")
  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateReportStatusDto, @CurrentUser() user: RequestUser) {
    return this.reportsService.updateStatus(id, dto.status, dto.note, user.sub);
  }
}
