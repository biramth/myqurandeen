import { Module } from "@nestjs/common";
import { ScholarsController } from "./scholars.controller";
import { ScholarsService } from "./scholars.service";

@Module({
  controllers: [ScholarsController],
  providers: [ScholarsService],
  exports: [ScholarsService],
})
export class ScholarsModule {}
