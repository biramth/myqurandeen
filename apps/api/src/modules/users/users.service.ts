import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";
import { randomBytes } from "node:crypto";
import type { RoleName } from "@qurandeen/shared";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { users } from "../../database/schema";
import { RbacService } from "../rbac/rbac.service";

export interface CreateUserInput {
  email: string;
  password: string;
  displayName: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly rbac: RbacService,
  ) {}

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async findByGoogleId(googleId: string) {
    return this.db.query.users.findFirst({ where: eq(users.googleId, googleId) });
  }

  async findById(id: string) {
    return this.db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async markEmailVerified(userId: string) {
    const [updated] = await this.db
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updatePassword(userId: string, password: string) {
    const passwordHash = await argon2.hash(password);
    await this.db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  }

  async createUser(input: CreateUserInput) {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new ConflictException("Un compte existe deja avec cet email");
    }

    const defaultRole = await this.rbac.findRoleByName("USER");
    if (!defaultRole) {
      throw new Error("Role USER introuvable - executez le seed RBAC");
    }

    const passwordHash = await argon2.hash(input.password);
    const [user] = await this.db
      .insert(users)
      .values({
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        roleId: defaultRole.id,
      })
      .returning();

    return user;
  }

  async verifyPassword(user: { passwordHash: string }, password: string): Promise<boolean> {
    return argon2.verify(user.passwordHash, password);
  }

  async listAll() {
    const rows = await this.db.query.users.findMany({
      orderBy: (u, { desc: descOp }) => descOp(u.createdAt),
    });
    const roleRows = await this.rbac.listRoles();
    const roleById = new Map(roleRows.map((r) => [r.id, r]));

    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      isActive: u.isActive,
      createdAt: u.createdAt,
      roleId: u.roleId,
      roleName: roleById.get(u.roleId)?.name ?? null,
    }));
  }

  async listRoles() {
    return this.rbac.listRoles();
  }

  async updateRole(userId: string, roleId: string) {
    const [updated] = await this.db.update(users).set({ roleId }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async setActive(userId: string, isActive: boolean) {
    const [updated] = await this.db.update(users).set({ isActive }).where(eq(users.id, userId)).returning();
    return updated;
  }

  /**
   * Cree un utilisateur Connecte via Google (email pre-verifie par Google) ou
   * lie le compte Google a un utilisateur email existant portant le meme
   * email. Le mot de passe est deletaire (impossible a utiliser) tant que
   * l'utilisateur n'a pas defini de mot de passe lui-meme.
   */
  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  }): Promise<{ user: NonNullable<Awaited<ReturnType<UsersService["findByEmail"]>>>; created: boolean }> {
    const existingByGoogle = await this.findByGoogleId(profile.googleId);
    if (existingByGoogle) {
      return { user: existingByGoogle, created: false };
    }

    const existingByEmail = await this.findByEmail(profile.email);
    if (existingByEmail) {
      // Lie le compte Google a l'email existant et marque l'email comme verifie.
      const [updated] = await this.db
        .update(users)
        .set({
          googleId: profile.googleId,
          emailVerifiedAt: existingByEmail.emailVerifiedAt ?? new Date(),
          ...(existingByEmail.avatarUrl ? {} : profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
        })
        .where(eq(users.id, existingByEmail.id))
        .returning();
      return { user: updated, created: false };
    }

    const defaultRole = await this.rbac.findRoleByName("USER");
    if (!defaultRole) {
      throw new Error("Role USER introuvable - executez le seed RBAC");
    }

    // Mot de passe aleatoire irrecuperable, impossible a utiliser en login par
    // mot de passe (compte cree via Google ; l'utilisateur pourra en definir un
    // quand le flux "definir un mot de passe" existera).
    const passwordHash = await argon2.hash(randomBytes(32).toString("base64url"));
    const [user] = await this.db
      .insert(users)
      .values({
        email: profile.email,
        passwordHash,
        displayName: profile.displayName,
        roleId: defaultRole.id,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
        emailVerifiedAt: new Date(),
      })
      .returning();

    return { user, created: true };
  }

  toPublicProfile(
    user: {
      id: string;
      email: string;
      displayName: string;
      locale: string;
      createdAt: Date;
      emailVerifiedAt: Date | null;
      avatarUrl: string | null;
    },
    roleName?: RoleName,
  ) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      locale: user.locale,
      memberSince: user.createdAt,
      emailVerified: Boolean(user.emailVerifiedAt),
      avatarUrl: user.avatarUrl,
      isStaff: Boolean(roleName) && roleName !== "USER",
    };
  }
}
