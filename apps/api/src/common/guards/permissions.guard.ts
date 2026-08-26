import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { PermissionValue } from "@qurandeen/shared";
import { PERMISSION_KEY } from "../decorators/require-permission.decorator";
import type { AuthenticatedRequest } from "../types/authenticated-request";

/**
 * Verifie la permission granulaire requise par @RequirePermission().
 * S'execute apres JwtAuthGuard (qui peuple request.user). Toute
 * verification d'autorisation se fait ici, cote serveur.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionValue | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const hasPermission = request.user?.permissions?.includes(required);
    if (!hasPermission) {
      throw new ForbiddenException(`Permission requise: ${required}`);
    }
    return true;
  }
}
