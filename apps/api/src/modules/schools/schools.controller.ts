import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SchoolsService } from "./schools.service";

@ApiTags("schools")
@Public()
@Controller("schools")
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  listSchools() {
    return this.schoolsService.listSchools();
  }

  @Get("fiqh-topics")
  listFiqhTopics() {
    return this.schoolsService.listFiqhTopics();
  }

  @Get("fiqh-topics/:slug")
  getFiqhTopicComparison(@Param("slug") slug: string) {
    return this.schoolsService.getFiqhTopicComparison(slug);
  }

  @Get(":slug")
  getSchool(@Param("slug") slug: string) {
    return this.schoolsService.getSchool(slug);
  }
}
