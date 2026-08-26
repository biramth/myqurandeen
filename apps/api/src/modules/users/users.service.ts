import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";
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

  async findById(id: string) {
    return this.db.query.users.findFirst({ where: eq(users.id, id) });
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

  toPublicProfile(user: {
    id: string;
    email: string;
    displayName: string;
    locale: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      locale: user.locale,
      memberSince: user.createdAt,
    };
  }
}
