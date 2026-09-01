import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";

/**
 * Valide le jeton de declenchement du planificateur (cron externe) envoye en
 * header `Authorization: Bearer <jeton>`, compare a l'env REMINDER_RUN_TOKEN.
 *
 * Utile pour exposer un endpoint sans session utilisateur (le cron externe
 * n'a pas de JWT) tout en restant protege : sans un jeton correspondant, il
 * serait possible de declencher des notifications de masse vers tous les
 * abonnes. A utiliser sur une route marquee @Public() (sinon JwtAuthGuard
 * global exigerait un JWT avant meme ce garde).
 */
@Injectable()
export class CronTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    const expected = process.env.REMINDER_RUN_TOKEN;
    if (!expected) {
      throw new UnauthorizedException("REMINDER_RUN_TOKEN non configure - endpoint de planification indisponible");
    }

    // Comparaison a temps constant pour ne pas fuiter le jeton par timing.
    if (!token || !this.timingSafeEqual(token, expected)) {
      throw new UnauthorizedException("Jeton de planification invalide");
    }
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) return undefined;
    return header.slice("Bearer ".length);
  }

  private timingSafeEqual(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }
}
