import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { UsersService } from "./users.service";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UpdateUserActiveDto } from "./dto/update-user-active.dto";

@ApiTags("admin-users")
@Controller("admin/users")
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermission("user:manage")
  @Get()
  listUsers() {
    return this.usersService.listAll();
  }

  @RequirePermission("user:manage")
  @Get("roles")
  listRoles() {
    return this.usersService.listRoles();
  }

  @RequirePermission("user:manage")
  @Patch(":id/role")
  updateRole(@Param("id") id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.roleId);
  }

  @RequirePermission("user:manage")
  @Patch(":id/active")
  updateActive(@Param("id") id: string, @Body() dto: UpdateUserActiveDto) {
    return this.usersService.setActive(id, dto.isActive);
  }
}
