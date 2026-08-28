import { Module } from "@nestjs/common";
import { UserDataController } from "./user-data.controller";
import { UserDataService } from "./user-data.service";

/** Donnees personnelles de l'utilisateur connecte : notes, favoris, collections. */
@Module({
  controllers: [UserDataController],
  providers: [UserDataService],
})
export class UserDataModule {}
