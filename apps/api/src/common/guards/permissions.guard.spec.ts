import { ForbiddenException, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
  type PermissionValue,
} from "@qurandeen/shared";
import { PermissionsGuard } from "./permissions.guard";
import { PERMISSION_KEY, RequirePermission } from "../decorators/require-permission.decorator";
import type { AuthenticatedRequest } from "../types/authenticated-request";

describe("DEFAULT_ROLE_PERMISSIONS (matrice RBAC)", () => {
  it("ne contient que des cles de permission connues (aucune typo)", () => {
    const known = new Set(Object.values(PERMISSIONS));
    for (const roleId of Object.keys(DEFAULT_ROLE_PERMISSIONS) as (keyof typeof DEFAULT_ROLE_PERMISSIONS)[]) {
      for (const perm of DEFAULT_ROLE_PERMISSIONS[roleId]) {
        expect(known.has(perm)).toBe(true);
        expect(perm).toMatch(/^[a-z_]+:[a-z_]+$/);
      }
    }
  });

  it("ne duplique jamais une permission dans un meme role", () => {
    for (const roleId of Object.keys(DEFAULT_ROLE_PERMISSIONS) as (keyof typeof DEFAULT_ROLE_PERMISSIONS)[]) {
      const perms = DEFAULT_ROLE_PERMISSIONS[roleId];
      expect(new Set(perms).size).toBe(perms.length);
    }
  });

  it("HERARCHIE : ADMIN et SUPER_ADMIN englobent tous les roles operationnels (MODERATOR/REVIEWER/EDITOR)", () => {
    const assertIncludes = (parent: Set<PermissionValue>, child: Set<PermissionValue>, childName: string) => {
      for (const perm of child) {
        expect(parent.has(perm)).toBe(true);
      }
    };

    const MODERATOR = new Set(DEFAULT_ROLE_PERMISSIONS.MODERATOR);
    const REVIEWER = new Set(DEFAULT_ROLE_PERMISSIONS.REVIEWER);
    const EDITOR = new Set(DEFAULT_ROLE_PERMISSIONS.EDITOR);
    const ADMIN = new Set(DEFAULT_ROLE_PERMISSIONS.ADMIN);
    const SUPER_ADMIN = new Set(DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN);

    assertIncludes(ADMIN, MODERATOR, "MODERATOR");
    assertIncludes(ADMIN, REVIEWER, "REVIEWER");
    assertIncludes(ADMIN, EDITOR, "EDITOR");
    assertIncludes(SUPER_ADMIN, ADMIN, "ADMIN");
  });

  it("USER ne porte aucune permission (lecture/favoris/notes uniquement)", () => {
    expect(DEFAULT_ROLE_PERMISSIONS.USER).toEqual([]);
  });

  it("SUPER_ADMIN est le seul role a pouvoir envoyer des campagnes email (impact global)", () => {
    for (const roleId of Object.keys(DEFAULT_ROLE_PERMISSIONS) as (keyof typeof DEFAULT_ROLE_PERMISSIONS)[]) {
      const hasMarketing = DEFAULT_ROLE_PERMISSIONS[roleId].includes(PERMISSIONS.MARKETING_SEND);
      if (roleId === "SUPER_ADMIN") {
        expect(hasMarketing).toBe(true);
      } else {
        expect(hasMarketing).toBe(false);
      }
    }
  });
});

describe("PermissionsGuard", () => {
  const buildContext = (permissions?: PermissionValue[]): ExecutionContext => {
    const request = Object.assign({ headers: {} }, { user: permissions ? { permissions } : undefined }) as AuthenticatedRequest;
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  const getGuard = async (permission?: PermissionValue) => {
    const moduleRef = await Test.createTestingModule({
      providers: [Reflector, PermissionsGuard],
    }).compile();
    const guard = moduleRef.get(PermissionsGuard);
    // Configure le metadata de la permission requise sur le handler.
    const reflector = moduleRef.get(Reflector);
    return { guard, reflector, permission };
  };

  it("laisse passer quand aucune @RequirePermission n'est definie", async () => {
    const { guard } = await getGuard();
    const context = buildContext(undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it("refuse (Forbidden) quand l'utilisateur n'a pas la permission", async () => {
    const { guard, reflector, permission } = await getGuard(PERMISSIONS.USER_MANAGE);
    const context = buildContext([PERMISSIONS.REPORT_VIEW]);
    reflector.getAllAndOverride = jest.fn().mockReturnValue(permission);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("accepte quand l'utilisateur a exactement la permission requise", async () => {
    const { guard, reflector, permission } = await getGuard(PERMISSIONS.AI_INDEX_MANAGE);
    const context = buildContext([PERMISSIONS.AI_INDEX_MANAGE]);
    reflector.getAllAndOverride = jest.fn().mockReturnValue(permission);
    expect(guard.canActivate(context)).toBe(true);
  });

  it("refuse (Forbidden) quand l'utilisateur n'est pas authentifie (pas de user.permissions)", async () => {
    const { guard, reflector, permission } = await getGuard(PERMISSIONS.MARKETING_SEND);
    const context = buildContext(undefined);
    reflector.getAllAndOverride = jest.fn().mockReturnValue(permission);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("honore pertinemment la hierarchie reelle : un ADMIN accede a ai:index, un USER non", async () => {
    const { guard, reflector } = await getGuard(PERMISSIONS.AI_INDEX_MANAGE);
    reflector.getAllAndOverride = jest.fn().mockReturnValue(PERMISSIONS.AI_INDEX_MANAGE);

    const adminCtx = buildContext(DEFAULT_ROLE_PERMISSIONS.ADMIN);
    expect(guard.canActivate(adminCtx)).toBe(true);

    const userCtx = buildContext(DEFAULT_ROLE_PERMISSIONS.USER);
    expect(() => guard.canActivate(userCtx)).toThrow(ForbiddenException);
  });

  it("RequirePermission definit bien le metadata lu par le guard", async () => {
    // Au niveau du conteneur: la permission req par handler doit matcher ce que le guard lit.
    class Route {
      @RequirePermission(PERMISSIONS.REPORT_VIEW)
      handler() {}
    }
    const { reflector, permission } = await getGuard(PERMISSIONS.REPORT_VIEW);
    const metadata = reflector.get(PERMISSION_KEY, Route.prototype.handler);
    expect(metadata).toBe(permission);
  });
});
