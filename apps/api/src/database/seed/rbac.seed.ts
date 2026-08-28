import { DEFAULT_ROLE_PERMISSIONS, ROLE_NAMES, type PermissionValue } from "@qurandeen/shared";
import type { Database } from "../database.module";
import { permissions, rolePermissions, roles } from "../schema";

const ROLE_DESCRIPTIONS: Record<(typeof ROLE_NAMES)[number], string> = {
  SUPER_ADMIN: "Accès complet, y compris gestion des rôles et permissions.",
  ADMIN: "Gestion des utilisateurs et de l'ensemble du contenu.",
  EDITOR: "Crée et modifie le contenu éditorial.",
  REVIEWER: "Valide et publie le contenu proposé.",
  MODERATOR: "Gère les signalements des utilisateurs.",
  USER: "Lecture, favoris, notes et progression personnelles.",
};

const PERMISSION_DESCRIPTIONS: Partial<Record<PermissionValue, string>> = {
  "user:manage": "Créer, modifier, désactiver des comptes utilisateurs.",
  "role:manage": "Modifier les rôles et les permissions associées.",
  "content:create": "Créer du contenu éditorial (brouillon).",
  "content:edit": "Modifier du contenu éditorial existant.",
  "content:publish": "Publier ou dépublier du contenu éditorial.",
  "report:view": "Consulter les signalements.",
  "report:assign": "Assigner un signalement à un modérateur.",
  "report:resolve": "Clôturer un signalement (workflow de modération).",
  "audit_log:read": "Consulter le journal d'audit.",
  "ai:index": "Déclencher la (re)indexation du contenu pour l'assistant IA (opération coûteuse en quota).",
};

/**
 * Seed idempotent des rôles et permissions RBAC (aucune donnée religieuse).
 * Peut être relancé sans dupliquer les lignes (upsert par clé unique).
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
