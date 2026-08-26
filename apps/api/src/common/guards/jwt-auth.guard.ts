import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AuthenticatedRequest, RequestUser } from "../types/authenticated-request";

/**
 * Verifie le JWT d'acces envoye en header `Authorization: Bearer <token>`.
 * Le refresh token (cookie httpOnly) est gere separement par AuthController.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException("Token d'acces manquant");
    }

    try {
      const payload = await this.jwtService.verifyAsync<RequestUser>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Token d'acces invalide ou expire");
    }
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) return undefined;
    return header.slice("Bearer ".length);
  }
}
