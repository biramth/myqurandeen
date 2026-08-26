import type { Request } from "express";
import type { PermissionValue, RoleName } from "@qurandeen/shared";

export interface RequestUser {
  sub: string;
  email: string;
  roleName: RoleName;
  permissions: PermissionValue[];
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}
