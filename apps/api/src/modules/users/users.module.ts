import { Module } from "@nestjs/common";
import { RbacModule } from "../rbac/rbac.module";
import { UsersService } from "./users.service";
import { UsersAdminController } from "./users-admin.controller";

@Module({
  imports: [RbacModule],
  controllers: [UsersAdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
