import { Global, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DRIZZLE } from "./database.constants";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Database => {
        const connectionString = config.get<string>("DATABASE_URL");
        // Le driver `pg` ne fait pas toujours confiance a la chaine de
        // certificats presentee par le pooler Supabase depuis un conteneur
        // (Render, Railway...) meme avec `sslmode=require` dans l'URL : ca
        // produit un "self-signed certificate in certificate chain" qui fait
        // planter chaque requete en 500 sans toucher au endpoint /health (qui
        // ne passe pas par la DB). On force donc `ssl` explicitement des que
        // l'URL demande du SSL.
        const ssl = connectionString?.includes("sslmode=require")
          ? { rejectUnauthorized: false }
          : undefined;
        const pool = new Pool({
          connectionString,
          ssl,
          // Sans ces limites, `pg` retombe sur ses defauts (max: 10, pas de
          // timeout) : une requete bloquee peut alors garder une connexion
          // indefiniment et affamer le pool. On borne explicitement la taille
          // du pool (coherent avec un service mono-instance) et on coupe les
          // connexions/requetes qui trainent.
          max: 15,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 10_000,
          statement_timeout: 15_000,
        });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnModuleDestroy {
  onModuleDestroy() {
    // Le pool `pg` ferme ses connexions automatiquement a l'arret du process ;
    // rien a nettoyer explicitement ici pour ce MVP mono-instance.
  }
}
