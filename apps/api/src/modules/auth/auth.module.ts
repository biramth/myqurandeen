import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { RbacModule } from "../rbac/rbac.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [JwtModule.register({}), UsersModule, RbacModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
