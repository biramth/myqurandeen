import { CacheInterceptor } from "@nestjs/cache-manager";
import { Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { HistoryService } from "./history.service";

@ApiTags("history")
@Public()
@UseInterceptors(CacheInterceptor)
@Controller("history")
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get("periods")
  listPeriods() {
    return this.historyService.listPeriods();
  }

  @Get("periods/:slug")
  getPeriod(@Param("slug") slug: string) {
    return this.historyService.getPeriod(slug);
  }

  @Get("events/:slug")
  getEvent(@Param("slug") slug: string) {
    return this.historyService.getEvent(slug);
  }
}
