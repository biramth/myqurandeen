import { config } from "dotenv";
import path from "node:path";
config({ path: path.resolve(process.cwd(), "../../.env") });

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL manquant");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log("Application des migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations appliquees avec succes.");

  await pool.end();
}

main().catch((error) => {
  console.error("Echec des migrations:", error);
  process.exit(1);
});
