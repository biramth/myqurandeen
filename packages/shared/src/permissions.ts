import { RoleName } from "./enums";

/**
 * Cle de permission au format "resource:action". Source de verite pour le
 * seed RBAC (apps/api) et pour les verifications d'affichage cote frontend
 * (qui ne remplacent jamais la verification serveur).
 */
export type PermissionKey = `${string}:${string}`;

export const PERMISSIONS = {
  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",
  CONTENT_CREATE: "content:create",
  CONTENT_EDIT: "content:edit",
  CONTENT_PUBLISH: "content:publish",
  REPORT_VIEW: "report:view",
  REPORT_ASSIGN: "report:assign",
  REPORT_RESOLVE: "report:resolve",
  FIQH_SUGGESTION_VIEW: "fiqh_suggestion:view",
  FIQH_SUGGESTION_RESOLVE: "fiqh_suggestion:resolve",
  AUDIT_LOG_READ: "audit_log:read",
  AI_INDEX_MANAGE: "ai:index",
} as const satisfies Record<string, PermissionKey>;

export type PermissionValue = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Mapping par defaut role -> permissions, utilise par le seed RBAC.
 * Modifiable en base ensuite (les permissions ne sont pas figees dans le
 * code en production).
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, PermissionValue[]> = {
  USER: [],
  MODERATOR: [PERMISSIONS.REPORT_VIEW, PERMISSIONS.REPORT_ASSIGN, PERMISSIONS.FIQH_SUGGESTION_VIEW],
  REVIEWER: [
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_RESOLVE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.FIQH_SUGGESTION_VIEW,
    PERMISSIONS.FIQH_SUGGESTION_RESOLVE,
  ],
  EDITOR: [
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.FIQH_SUGGESTION_VIEW,
  ],
  ADMIN: [
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_ASSIGN,
    PERMISSIONS.REPORT_RESOLVE,
    PERMISSIONS.FIQH_SUGGESTION_VIEW,
    PERMISSIONS.FIQH_SUGGESTION_RESOLVE,
    PERMISSIONS.AUDIT_LOG_READ,
    PERMISSIONS.AI_INDEX_MANAGE,
  ],
  SUPER_ADMIN: [
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.ROLE_MANAGE,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_ASSIGN,
    PERMISSIONS.REPORT_RESOLVE,
    PERMISSIONS.FIQH_SUGGESTION_VIEW,
    PERMISSIONS.FIQH_SUGGESTION_RESOLVE,
    PERMISSIONS.AUDIT_LOG_READ,
    PERMISSIONS.AI_INDEX_MANAGE,
  ],
};
