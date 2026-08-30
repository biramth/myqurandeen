import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { LearningService } from "./learning.service";
import { ToggleLessonDto } from "./dto/toggle-lesson.dto";

@ApiTags("learning")
@Controller("learning")
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Public()
  @Get("paths")
  listPaths() {
    return this.learningService.listPaths();
  }

  @Public()
  @Get("paths/:slug")
  getPath(@Param("slug") slug: string) {
    return this.learningService.getPath(slug);
  }

  @Public()
  @Get("paths/:slug/quiz")
  getPathFinalQuiz(@Param("slug") slug: string) {
    return this.learningService.getPathFinalQuiz(slug);
  }

  @Public()
  @Get("lessons/:id/quiz")
  getLessonQuiz(@Param("id") id: string) {
    return this.learningService.getLessonQuiz(id);
  }

  @Get("progress")
  getProgress(@CurrentUser() user: RequestUser) {
    return this.learningService.getUserProgress(user.sub);
  }

  @Post("lessons/:id/toggle")
  toggleLesson(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: ToggleLessonDto) {
    return this.learningService.toggleLessonCompletion(user.sub, id, dto.localDate);
  }
}
