import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SearchService } from "./search.service";

@ApiTags("search")
@Public()
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query("q") q?: string) {
    return this.searchService.search(q ?? "");
  }
}
