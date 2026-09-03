import { DB_QUERY_CONCURRENCY_LIMIT, Semaphore, withConcurrencyLimit } from "./db-query-semaphore";

describe("Semaphore", () => {
  it("laisse passer immediatement tant que des jetons sont disponibles", async () => {
    const sem = new Semaphore(2);
    await sem.acquire();
    await sem.acquire();
    // Les 2 jetons sont pris - verifie via le comportement plutot qu'un champ prive.
    let acquired = false;
    const pending = sem.acquire().then(() => {
      acquired = true;
    });
    await Promise.resolve();
    expect(acquired).toBe(false);

    sem.release();
    await pending;
    expect(acquired).toBe(true);
  });

  it("libere un jeton au prochain en attente, dans l'ordre d'arrivee", async () => {
    const sem = new Semaphore(1);
    await sem.acquire(); // prend l'unique jeton

    const order: number[] = [];
    const waiter1 = sem.acquire().then(() => order.push(1));
    const waiter2 = sem.acquire().then(() => order.push(2));

    sem.release(); // doit reveiller waiter1
    await waiter1;
    sem.release(); // doit reveiller waiter2
    await waiter2;

    expect(order).toEqual([1, 2]);
  });
});

describe("withConcurrencyLimit", () => {
  it(`ne demarre jamais plus de DB_QUERY_CONCURRENCY_LIMIT (${DB_QUERY_CONCURRENCY_LIMIT}) taches en meme temps`, async () => {
    let running = 0;
    let maxRunning = 0;

    const makeTask = (delayMs: number) => async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      running--;
      return delayMs;
    };

    // Plus de taches que le semaphore n'autorise de jetons, pour verifier la borne reellement.
    const tasks = Array.from({ length: DB_QUERY_CONCURRENCY_LIMIT * 3 }, () => makeTask(20)) as unknown as [
      () => Promise<number>,
    ];
    await withConcurrencyLimit(tasks);

    expect(maxRunning).toBeLessThanOrEqual(DB_QUERY_CONCURRENCY_LIMIT);
  });

  it("conserve l'ordre des resultats independamment de l'ordre de resolution", async () => {
    const slow = async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
      return "slow";
    };
    const fast = async () => "fast";

    const [first, second] = await withConcurrencyLimit([slow, fast] as const);
    expect(first).toBe("slow");
    expect(second).toBe("fast");
  });

  it("ne demarre pas les taches avant d'acquerir un jeton (thunks, pas des promesses deja lancees)", async () => {
    const started: number[] = [];
    const tasks = [1, 2, 3].map((n) => async () => {
      started.push(n);
      return n;
    });

    // Rien ne doit avoir demarre avant l'appel.
    expect(started).toEqual([]);
    await withConcurrencyLimit(tasks as [() => Promise<number>, () => Promise<number>, () => Promise<number>]);
    expect(started.sort()).toEqual([1, 2, 3]);
  });
});
