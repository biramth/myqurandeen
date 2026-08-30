import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { authTokens, type AuthTokenType } from "../../database/schema";

/**
 * Gestion des jetons a usage unique pour la verification email et la
 * reinitialisation de mot de passe. Seul le hash (SHA-256) du jeton est
 * persiste en base : le jeton brut n'existe que dans l'email envoye et n'est
 * jamais stocke cote serveur.
 */
@Injectable()
export class AuthTokensService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  private hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  /** Genere un jeton, le stocke (hash), et renvoie le jeton brut (inconnu de la base). */
  async create(
    userId: string,
    type: AuthTokenType,
    ttlSeconds: number,
  ): Promise<string> {
    await this.revokeAllForUser(userId, type);

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.db.insert(authTokens).values({
      userId,
      type,
      tokenHash: this.hash(token),
      expiresAt,
    });

    return token;
  }

  /**
   * Valide un jeton brut pour un type donne. Renvoie le userId si le jeton
   * est valide (existe, non utilise, non expire), et le marque utilise.
   */
  async consume(token: string, type: AuthTokenType): Promise<string> {
    if (!token) {
      throw new UnauthorizedException("Jeton invalide ou expire");
    }
    const tokenHash = this.hash(token);
    const row = await this.db.query.authTokens.findFirst({
      where: and(
        eq(authTokens.tokenHash, tokenHash),
        eq(authTokens.type, type),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    });

    if (!row) {
      throw new UnauthorizedException("Jeton invalide ou expire");
    }

    await this.db
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(eq(authTokens.id, row.id));

    return row.userId;
  }

  private async revokeAllForUser(userId: string, type: AuthTokenType): Promise<void> {
    await this.db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.type, type)));
  }
}
