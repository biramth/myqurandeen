import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";

/**
 * Verrou consultatif Postgres (pg_advisory_lock) pour les 3 planificateurs
 * de rappels : actuellement sans effet reel (deploiement mono-instance, une
 * seule instance existe donc le verrou est toujours libre et acquis
 * immediatement), mais protege contre un double-envoi si l'app tournait un
 * jour sur plusieurs instances - voir les commentaires "verrou distribue" deja
 * presents dans ReminderSchedulerService/DuaSchedulerService/StreakAlertSchedulerService.
 *
 * Utilise un pool dedie separe (une connexion par planificateur au plus,
 * `max: 3`) plutot que le pool Drizzle partage de DatabaseModule :
 * pg_try_advisory_lock/pg_advisory_unlock DOIVENT s'executer sur exactement
 * la meme connexion physique, ce qu'un pool applicatif classique (jusqu'a 15
 * connexions, requetes reparties librement) ne garantit pas - un verrou pris
 * sur une connexion et "relache" sur une autre resterait bloque en pratique
 * jusqu'a la fermeture de cette connexion. Ce pool dedie reste minuscule et
 * inactif la plupart du temps (une poignee de requetes/minute).
 */
@Injectable()
export class SchedulerLockService implements OnModuleDestroy {
  private readonly logger = new Logger(SchedulerLockService.name);
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>("DATABASE_URL");
    // Meme logique SSL que DatabaseModule (pooler Supabase depuis un conteneur).
    const ssl = connectionString?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined;
    this.pool = new Pool({ connectionString, ssl, max: 3, idleTimeoutMillis: 30_000 });
  }

  /**
   * Execute `fn` seulement si le verrou `key` est obtenu (non bloquant) ;
   * ignore silencieusement sinon (une autre instance traite deja ce tick).
   * Verrou et connexion sont toujours relaches, meme si `fn` leve une erreur -
   * une erreur venant de `fn` continue de se propager normalement vers
   * l'appelant (le try/catch de chaque tick() garde donc son propre message
   * de log inchange) ; seul un echec d'acquisition du verrou lui-meme
   * (connexion dediee indisponible...) est intercepte et journalise ici.
   */
  async withLock(key: number, fn: () => Promise<void>): Promise<void> {
    let client;
    try {
      client = await this.pool.connect();
    } catch (error) {
      this.logger.error(`Impossible d'acquerir le verrou planificateur (cle ${key}) : ${(error as Error).message}`);
      return;
    }
    try {
      const { rows } = await client.query<{ locked: boolean }>("SELECT pg_try_advisory_lock($1) AS locked", [key]);
      if (!rows[0]?.locked) return;
      try {
        await fn();
      } finally {
        await client.query("SELECT pg_advisory_unlock($1)", [key]);
      }
    } finally {
      client.release();
    }
  }

  onModuleDestroy() {
    void this.pool.end();
  }
}
