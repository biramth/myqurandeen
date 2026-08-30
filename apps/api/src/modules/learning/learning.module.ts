import { Module } from "@nestjs/common";
import { LearningController } from "./learning.controller";
import { LearningService } from "./learning.service";
import { StreaksModule } from "../streaks/streaks.module";

@Module({
  imports: [StreaksModule],
  controllers: [LearningController],
  providers: [LearningService],
})
export class LearningModule {}
