import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { ScholarsService } from "./scholars.service";

@ApiTags("scholars")
@Public()
@Controller("scholars")
export class ScholarsController {
  constructor(private readonly scholarsService: ScholarsService) {}

  @Get()
  listScholars() {
    return this.scholarsService.listScholars();
  }

  @Get(":slug")
  getScholar(@Param("slug") slug: string) {
    return this.scholarsService.getScholar(slug);
  }
}
