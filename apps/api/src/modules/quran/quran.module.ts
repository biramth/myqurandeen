import { Module } from "@nestjs/common";
import { QuranAudioProxyController } from "./quran-audio-proxy.controller";
import { QuranController } from "./quran.controller";
import { QuranService } from "./quran.service";

@Module({
  controllers: [QuranController, QuranAudioProxyController],
  providers: [QuranService],
  exports: [QuranService],
})
export class QuranModule {}
