import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { roles, users } from "../schema";

/**
 * Cree un premier compte SUPER_ADMIN uniquement si ADMIN_EMAIL et
 * ADMIN_PASSWORD sont fournis en variables d'environnement. Aucun mot de
 * passe par defaut n'est code en dur.
 */
export async function seedBootstrapAdmin(db: Database): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("Bootstrap admin: ADMIN_EMAIL/ADMIN_PASSWORD absents, étape ignoree.");
    return;
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    console.log(`Bootstrap admin: ${email} existe deja, etape ignoree.`);
    return;
  }

  const superAdminRole = await db.query.roles.findFirst({ where: eq(roles.name, "SUPER_ADMIN") });
  if (!superAdminRole) {
    throw new Error("Rôle SUPER_ADMIN introuvable - lancez d'abord le seed RBAC.");
  }

  const passwordHash = await argon2.hash(password);
  await db.insert(users).values({
    email,
    passwordHash,
    displayName: "Administrateur",
    roleId: superAdminRole.id,
    emailVerifiedAt: new Date(),
  });

  console.log(`Bootstrap admin: compte SUPER_ADMIN cree pour ${email}.`);
}
