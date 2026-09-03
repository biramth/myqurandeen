import { Module } from "@nestjs/common";
import { DailyController } from "./daily.controller";
import { DailyService } from "./daily.service";

@Module({
  controllers: [DailyController],
  providers: [DailyService],
  // Reutilise par SocialModule (publication auto reseaux sociaux, meme
  // selection deterministe que la page d'accueil - voir SocialPosterService).
  exports: [DailyService],
})
export class DailyModule {}
