import { Global, Logger, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DRIZZLE } from "./database.constants";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

const logger = new Logger("DatabasePool");

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
        // OBLIGATOIRE avec `pg.Pool` : sans ecouteur sur son evenement
        // `error`, la moindre connexion IDLE qui tombe (reseau, pooler
        // Supabase qui recycle une session, cf. EMAXCONNSESSION sous forte
        // charge) devient une exception non rattrapee qui FAIT PLANTER TOUT
        // LE PROCESSUS Node (comportement documente de `pg`/`pg-pool` - un
        // EventEmitter sans ecouteur sur `error` la relance en exception).
        // Deja observe en conditions reelles : crash complet de l'API en
        // dev ET des 502 intermittents en prod (Render redemarre le
        // processus) pendant le meme episode que le fix EMAXCONNSESSION du
        // sitemap (voir ROADMAP.md 0.1) - la connexion en cause n'etait pas
        // forcement celle qui venait de servir une requete, d'ou l'absence
        // de tout log applicatif au moment du crash.
        pool.on("error", (error) => {
          logger.error(`Connexion pool inattendue perdue (client idle) : ${error.message}`, error.stack);
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
