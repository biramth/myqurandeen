import { CacheInterceptor } from "@nestjs/cache-manager";
import { Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { ConceptsService } from "./concepts.service";

@ApiTags("concepts")
@Public()
@UseInterceptors(CacheInterceptor)
@Controller("concepts")
export class ConceptsController {
  constructor(private readonly conceptsService: ConceptsService) {}

  @Get()
  listConcepts() {
    return this.conceptsService.listConcepts();
  }

  @Get(":slug")
  getConcept(@Param("slug") slug: string) {
    return this.conceptsService.getConcept(slug);
  }
}
