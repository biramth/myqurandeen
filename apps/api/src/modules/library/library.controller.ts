import { CacheInterceptor } from "@nestjs/cache-manager";
import { Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { LibraryService } from "./library.service";

@ApiTags("library")
@UseInterceptors(CacheInterceptor)
@Controller("library")
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Public()
  @Get("categories")
  listCategories() {
    return this.libraryService.listCategories();
  }

  @Public()
  @Get("books")
  listBooks() {
    return this.libraryService.listBooks();
  }

  @Public()
  @Get("books/:slug")
  getBook(@Param("slug") slug: string) {
    return this.libraryService.getBook(slug);
  }
}
