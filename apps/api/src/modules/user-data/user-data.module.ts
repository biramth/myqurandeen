import { Module } from "@nestjs/common";
import { UserDataController } from "./user-data.controller";
import { UserDataService } from "./user-data.service";
import { StreaksModule } from "../streaks/streaks.module";

/** Donnees personnelles de l'utilisateur connecte : notes, favoris, collections. */
@Module({
  imports: [StreaksModule],
  controllers: [UserDataController],
  providers: [UserDataService],
})
export class UserDataModule {}
