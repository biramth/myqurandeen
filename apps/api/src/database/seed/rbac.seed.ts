import { DEFAULT_ROLE_PERMISSIONS, ROLE_NAMES, type PermissionValue } from "@qurandeen/shared";
import type { Database } from "../database.module";
import { permissions, rolePermissions, roles } from "../schema";

const ROLE_DESCRIPTIONS: Record<(typeof ROLE_NAMES)[number], string> = {
  SUPER_ADMIN: "Acces complet, y compris gestion des roles et permissions.",
  ADMIN: "Gestion des utilisateurs et de l'ensemble du contenu.",
  EDITOR: "Cree et modifie le contenu editorial.",
  REVIEWER: "Valide et publie le contenu propose.",
  MODERATOR: "Gere les signalements des utilisateurs.",
  USER: "Lecture, favoris, notes et progression personnelles.",
};

const PERMISSION_DESCRIPTIONS: Partial<Record<PermissionValue, string>> = {
  "user:manage": "Creer, modifier, desactiver des comptes utilisateurs.",
  "role:manage": "Modifier les roles et les permissions associees.",
  "content:create": "Creer du contenu editorial (brouillon).",
  "content:edit": "Modifier du contenu editorial existant.",
  "content:publish": "Publier ou depublier du contenu editorial.",
  "report:view": "Consulter les signalements.",
  "report:assign": "Assigner un signalement a un moderateur.",
  "report:resolve": "Cloturer un signalement (workflow de moderation).",
  "audit_log:read": "Consulter le journal d'audit.",
};

/**
 * Seed idempotent des roles et permissions RBAC (aucune donnee religieuse).
 * Peut etre relance sans dupliquer les lignes (upsert par cle unique).
 */
export async function seedRbac(db: Database): Promise<void> {
  const allPermissionKeys = Array.from(new Set(Object.values(DEFAULT_ROLE_PERMISSIONS).flat()));

  for (const key of allPermissionKeys) {
    const [resource, action] = key.split(":");
    await db
      .insert(permissions)
      .values({
        key,
        resource,
        action,
        description: PERMISSION_DESCRIPTIONS[key],
      })
      .onConflictDoNothing({ target: permissions.key });
  }

  for (const roleName of ROLE_NAMES) {
    await db
      .insert(roles)
      .values({ name: roleName, description: ROLE_DESCRIPTIONS[roleName] })
      .onConflictDoNothing({ target: roles.name });
  }

  const dbRoles = await db.select().from(roles);
  const dbPermissions = await db.select().from(permissions);

  for (const roleName of ROLE_NAMES) {
    const role = dbRoles.find((r) => r.name === roleName);
    if (!role) continue;

    for (const permissionKey of DEFAULT_ROLE_PERMISSIONS[roleName]) {
      const permission = dbPermissions.find((p) => p.key === permissionKey);
      if (!permission) continue;

      await db
        .insert(rolePermissions)
        .values({ roleId: role.id, permissionId: permission.id })
        .onConflictDoNothing({ target: [rolePermissions.roleId, rolePermissions.permissionId] });
    }
  }

  console.log(`RBAC: ${ROLE_NAMES.length} roles, ${allPermissionKeys.length} permissions seedes.`);
}
