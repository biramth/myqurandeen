import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { TargetType } from "@qurandeen/shared";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { UserDataService } from "./user-data.service";
import { ToggleBookmarkDto } from "./dto/toggle-bookmark.dto";
import { CreateNoteDto } from "./dto/create-note.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";
import { AddCollectionItemDto } from "./dto/add-collection-item.dto";
import { RecordLastReadDto } from "./dto/record-last-read.dto";

/** Donnees personnelles de l'utilisateur connecte (notes, favoris, collections) - JwtAuthGuard global impose d'etre authentifie, aucune route n'est @Public(). */
@ApiTags("user-data")
@Controller("user-data")
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  // --- Favoris ---

  @Get("bookmarks")
  listBookmarks(@CurrentUser() user: RequestUser, @Query("targetType") targetType?: TargetType) {
    return this.userDataService.listBookmarks(user.sub, targetType);
  }

  @Get("bookmarks/check")
  checkBookmark(
    @CurrentUser() user: RequestUser,
    @Query("targetType") targetType: TargetType,
    @Query("targetId") targetId: string,
  ) {
    return this.userDataService.isBookmarked(user.sub, targetType, targetId).then((bookmarked) => ({ bookmarked }));
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post("bookmarks/toggle")
  toggleBookmark(@CurrentUser() user: RequestUser, @Body() dto: ToggleBookmarkDto) {
    return this.userDataService.toggleBookmark(user.sub, dto.targetType, dto.targetId, dto.localDate);
  }

  // --- Notes ---

  @Get("notes")
  listNotes(
    @CurrentUser() user: RequestUser,
    @Query("targetType") targetType?: TargetType,
    @Query("targetId") targetId?: string,
  ) {
    return this.userDataService.listNotes(user.sub, targetType, targetId);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post("notes")
  createNote(@CurrentUser() user: RequestUser, @Body() dto: CreateNoteDto) {
    return this.userDataService.createNote(user.sub, dto.targetType, dto.targetId, dto.content, dto.isPrivate, dto.localDate);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Patch("notes/:id")
  updateNote(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: UpdateNoteDto) {
    return this.userDataService.updateNote(user.sub, id, dto.content, dto.isPrivate);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Delete("notes/:id")
  deleteNote(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.userDataService.deleteNote(user.sub, id);
  }

  // --- Collections ---

  @Get("collections")
  listCollections(@CurrentUser() user: RequestUser) {
    return this.userDataService.listCollections(user.sub);
  }

  @Get("collections/:id")
  getCollection(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.userDataService.getCollection(user.sub, id);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post("collections")
  createCollection(@CurrentUser() user: RequestUser, @Body() dto: CreateCollectionDto) {
    return this.userDataService.createCollection(user.sub, dto.name, dto.description);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Patch("collections/:id")
  updateCollection(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: UpdateCollectionDto) {
    return this.userDataService.updateCollection(user.sub, id, dto.name, dto.description);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Delete("collections/:id")
  deleteCollection(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.userDataService.deleteCollection(user.sub, id);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post("collections/:id/items")
  addCollectionItem(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: AddCollectionItemDto) {
    return this.userDataService.addCollectionItem(user.sub, id, dto.targetType, dto.targetId, dto.localDate);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Delete("collections/:id/items/:itemId")
  removeCollectionItem(@Param("id") id: string, @Param("itemId") itemId: string, @CurrentUser() user: RequestUser) {
    return this.userDataService.removeCollectionItem(user.sub, id, itemId);
  }

  // --- Reprendre ou j'en etais (derniere position de lecture) ---

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post("last-read")
  recordLastRead(@CurrentUser() user: RequestUser, @Body() dto: RecordLastReadDto) {
    return this.userDataService.recordLastRead(user.sub, dto.targetType as TargetType, dto.targetId);
  }

  @Get("last-read")
  listLastRead(@CurrentUser() user: RequestUser, @Query("limit") limit?: string) {
    const parsed = Number(limit);
    return this.userDataService.listLastRead(user.sub, Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 10) : 3);
  }
}
