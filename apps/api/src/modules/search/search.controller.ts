import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/public.decorator";
import { SearchService } from "./search.service";

@ApiTags("search")
@Public()
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Requete transverse la plus couteuse de l'API (FTS + similarite trigramme
   * sur une dizaine de tables, non mise en cache contrairement au contenu de
   * reference) : limite dediee, plus stricte que le defaut global (120/min),
   * pour eviter qu'un usage automatise ne sature la base.
   */
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get()
  search(@Query("q") q?: string) {
    return this.searchService.search(q ?? "");
  }
}
