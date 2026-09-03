import { Module } from "@nestjs/common";
import { DailyModule } from "../daily/daily.module";
import { OgModule } from "../og/og.module";
import { FacebookPublisherService } from "./facebook-publisher.service";
import { SocialPosterService } from "./social-poster.service";
import { TwitterPublisherService } from "./twitter-publisher.service";

@Module({
  imports: [DailyModule, OgModule],
  providers: [SocialPosterService, TwitterPublisherService, FacebookPublisherService],
  exports: [SocialPosterService],
})
export class SocialModule {}
