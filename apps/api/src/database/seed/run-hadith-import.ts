import { config } from "dotenv";
import path from "node:path";
config({ path: path.resolve(process.cwd(), "../../.env") });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schema";
import { importHadiths } from "./hadith-import";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL manquant");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  await importHadiths(db);

  await pool.end();
}

main().catch((error) => {
  console.error("Echec de l'import des hadiths:", error);
  process.exit(1);
});
