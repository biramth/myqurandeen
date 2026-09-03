/**
 * Semaphore PARTAGE par toute l'API pour brider le nombre de requetes SQL
 * paralleles, tous appelants confondus - pas juste au sein d'un seul appel.
 * Le pool Postgres partage par toute l'API est borne a 15 connexions
 * (DatabaseModule) : un service qui declenche plusieurs requetes en
 * parallele (recherche transverse, generation de sitemap...) peut a lui seul
 * saturer le pool et faire echouer en cascade LE RESTE de l'API
 * (EMAXCONNSESSION), pas seulement l'appelant. D'ou un seul semaphore
 * partage par tous les appelants plutot qu'une limite locale a chacun -
 * deux services bornes chacun a 6 en parallele mais independamment
 * pourraient quand meme cumuler jusqu'a 12 connexions simultanees si chacun
 * a sa propre limite.
 *
 * Extrait de `SearchService` (recherche transverse, jusqu'a 12 requetes par
 * appel - voir l'audit rate limiting, ROADMAP.md 0.1) pour etre reutilise par
 * `SitemapService`, qui souffrait du meme probleme : `generatePart("static")`
 * declenchait jusqu'a 16 requetes en parallele (6 + les 10 de
 * `collectSmallRows`), largement au-dessus du pool a elle seule -
 * `EMAXCONNSESSION` systematique, meme sans aucun autre trafic concurrent.
 */
export const DB_QUERY_CONCURRENCY_LIMIT = 6;

/** Semaphore classique : `permits` jetons, `acquire()` attend qu'un jeton soit libre, `release()` le rend (au prochain en attente s'il y en a). */
export class Semaphore {
  private available: number;
  private readonly waiters: Array<() => void> = [];

  constructor(permits: number) {
    this.available = permits;
  }

  async acquire(): Promise<void> {
    if (this.available > 0) {
      this.available--;
      return;
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve));
  }

  release(): void {
    const next = this.waiters.shift();
    if (next) {
      next(); // jeton transmis directement au suivant, `available` ne change pas
    } else {
      this.available++;
    }
  }
}

const dbQuerySemaphore = new Semaphore(DB_QUERY_CONCURRENCY_LIMIT);

/**
 * Execute des taches asynchrones en respectant le semaphore partage
 * ci-dessus, en conservant l'ordre des resultats. Les taches ne doivent PAS
 * etre deja demarrees (des thunks, pas des promesses) : un query builder
 * Drizzle est un "thenable" qui declenche sa requete des qu'on
 * l'awaite/le `.then()` - le passer directement dans un tableau (comme
 * `Promise.all`) demarrerait donc toutes les requetes immediatement, avant
 * meme d'acquerir un jeton.
 */
export async function withConcurrencyLimit<T extends readonly (() => Promise<unknown>)[]>(
  tasks: readonly [...T],
): Promise<{ -readonly [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const results = await Promise.all(
    tasks.map(async (task) => {
      await dbQuerySemaphore.acquire();
      try {
        return await task();
      } finally {
        dbQuerySemaphore.release();
      }
    }),
  );
  return results as { -readonly [K in keyof T]: Awaited<ReturnType<T[K]>> };
}
