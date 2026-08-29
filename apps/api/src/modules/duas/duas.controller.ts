import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { DuasService } from "./duas.service";

@ApiTags("duas")
@Public()
@Controller("duas")
export class DuasController {
  constructor(private readonly duasService: DuasService) {}

  @Get("categories")
  listCategories() {
    return this.duasService.listCategories();
  }

  @Get("categories/:slug")
  getCategory(@Param("slug") slug: string) {
    return this.duasService.getCategory(slug);
  }
}
