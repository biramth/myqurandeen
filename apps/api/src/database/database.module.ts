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
        const pool = new Pool({ connectionString: config.get<string>("DATABASE_URL") });
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
