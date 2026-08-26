import { SetMetadata } from "@nestjs/common";
import type { PermissionValue } from "@qurandeen/shared";

export const PERMISSION_KEY = "requiredPermission";

/**
 * Exige une permission granulaire pour acceder a la route. Toujours
 * verifiee cote serveur par PermissionsGuard - ne jamais se fier a un
 * masquage cote frontend pour la securite.
 */
export const RequirePermission = (permission: PermissionValue) =>
  SetMetadata(PERMISSION_KEY, permission);
