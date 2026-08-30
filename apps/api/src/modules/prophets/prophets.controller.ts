import { CacheInterceptor } from "@nestjs/cache-manager";
import { Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { ProphetsService } from "./prophets.service";

@ApiTags("prophets")
@Public()
@UseInterceptors(CacheInterceptor)
@Controller("prophets")
export class ProphetsController {
  constructor(private readonly prophetsService: ProphetsService) {}

  @Get()
  listProphets() {
    return this.prophetsService.listProphets();
  }

  @Get(":slug")
  getProphet(@Param("slug") slug: string) {
    return this.prophetsService.getProphet(slug);
  }
}
