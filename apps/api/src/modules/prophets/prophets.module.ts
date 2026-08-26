import { Module } from "@nestjs/common";
import { ProphetsController } from "./prophets.controller";
import { ProphetsService } from "./prophets.service";

@Module({
  controllers: [ProphetsController],
  providers: [ProphetsService],
})
export class ProphetsModule {}
