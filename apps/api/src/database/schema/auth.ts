import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_columns";
import { users } from "./identity";

/** Types de jeton temporaire a usage unique (verification email / reset). */
export const authTokenType = ["email_verify", "password_reset"] as const;
export type AuthTokenType = (typeof authTokenType)[number];

/**
 * Jetons de verification email et de reinitialisation de mot de passe.
 * Seul le hash du jeton est stocke : le jeton brut n'est envoye que par email
 * et n'est jamais persiste, limitant l'impact d'une fuite de base.
 */
export const authTokens = pgTable(
  "auth_tokens",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("auth_tokens_user_idx").on(t.userId),
    index("auth_tokens_token_type_idx").on(t.tokenHash, t.type),
  ],
);
