import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { RbacModule } from "../rbac/rbac.module";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../mail/mail.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthTokensService } from "./auth-tokens.service";

@Module({
  imports: [ConfigModule, JwtModule.register({}), UsersModule, RbacModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, AuthTokensService],
})
export class AuthModule {}
