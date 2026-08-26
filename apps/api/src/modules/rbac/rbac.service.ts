import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { PermissionValue, RoleName } from "@qurandeen/shared";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { permissions, rolePermissions, roles } from "../../database/schema";

export interface RoleWithPermissions {
  roleId: string;
  roleName: RoleName;
  permissions: PermissionValue[];
}

@Injectable()
export class RbacService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /** Charge le role et ses permissions pour construire le payload JWT au login/refresh. */
  async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | null> {
    const role = await this.db.query.roles.findFirst({ where: eq(roles.id, roleId) });
    if (!role) return null;

    const rows = await this.db
      .select({ key: permissions.key })
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(eq(rolePermissions.roleId, roleId));

    return {
      roleId: role.id,
      roleName: role.name as RoleName,
      permissions: rows.map((r) => r.key as PermissionValue),
    };
  }

  async findRoleByName(name: RoleName) {
    return this.db.query.roles.findFirst({ where: eq(roles.name, name) });
  }

  async listRoles() {
    return this.db.select().from(roles);
  }
}
