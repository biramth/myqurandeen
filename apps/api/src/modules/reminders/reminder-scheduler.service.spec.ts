import { alreadySentToday, GRACE_MINUTES, localClock, minutesSince } from "./scheduling-logic";

describe("minutesSince", () => {
  it("renvoie 0 quand les heures sont identiques", () => {
    expect(minutesSince("08:00", "08:00")).toBe(0);
  });

  it("renvoie un nombre positif quand la cible est passee", () => {
    // 08:05 - 06:00 = 125 mn
    expect(minutesSince("08:05", "06:00")).toBe(125);
  });

  it("renvoie un nombre negatif quand la cible est dans le futur", () => {
    // 06:00 - 08:05 = -125 mn
    expect(minutesSince("06:00", "08:05")).toBe(-125);
  });

  it("traverse correctement la frontiere d'heure", () => {
    // 09:01 - 08:59 = 2 mn
    expect(minutesSince("09:01", "08:59")).toBe(2);
  });

  it("gère minuit (00:xx)", () => {
    expect(minutesSince("00:30", "23:45")).toBe(-1395);
    expect(minutesSince("00:00", "00:00")).toBe(0);
  });
});

describe("localClock", () => {
  it("retourne l'heure murale dans un fuseau IANA donne", () => {
    // 12:00 UTC le 21/06 en EST (UTC-4 l'ete) = 08:00
    const clock = localClock("America/New_York", new Date("2026-06-21T12:00:00Z"));
    expect(clock).not.toBeNull();
    expect(clock!.hhmm).toBe("08:00");
    expect(clock!.dateKey).toBe("2026-06-21");
  });

  it("retourne null pour un fuseau invalide", () => {
    expect(localClock("Not/AZone", new Date())).toBeNull();
  });

  it("normalise minuit '24' en '00'", () => {
    const clock = localClock("UTC", new Date("2026-01-01T00:00:00Z"));
    expect(clock).not.toBeNull();
    expect(clock!.hhmm).toBe("00:00");
  });
});

describe("alreadySentToday", () => {
  it("retourne false si le dernier envoi etait un autre jour calendaire", () => {
    const clock = localClock("UTC", new Date("2026-06-21T10:00:00Z"))!;
    const lastSent = new Date("2026-06-20T09:00:00Z");
    expect(alreadySentToday("UTC", lastSent, "08:05", clock)).toBe(false);
  });

  it("retourne true si l'envoi du jour a eu lieu apres ou a l'heure cible", () => {
    const clock = localClock("UTC", new Date("2026-06-21T10:00:00Z"))!;
    const lastSent = new Date("2026-06-21T08:30:00Z");
    expect(alreadySentToday("UTC", lastSent, "08:05", clock)).toBe(true);
  });

  it("retourne false si l'envoi du jour a eu lieu avant la cible (heure decalee vers plus tard)", () => {
    // Cas du bug corrige : cible passee de 06:00 a 08:05 dans la journee,
    // il faut re-envoyer meme si l'envoi initial etait ce matin.
    const clock = localClock("UTC", new Date("2026-06-21T10:00:00Z"))!;
    const lastSent = new Date("2026-06-21T06:00:00Z");
    expect(alreadySentToday("UTC", lastSent, "08:05", clock)).toBe(false);
  });

  it("retourne true exactement a l'heure cible (>=)", () => {
    const clock = localClock("UTC", new Date("2026-06-21T08:05:30Z"))!;
    const lastSent = new Date("2026-06-21T08:05:00Z");
    expect(alreadySentToday("UTC", lastSent, "08:05", clock)).toBe(true);
  });
});

describe("GRACE_MINUTES", () => {
  it("definit une tolerance de rattrapage positive et raisonnable", () => {
    expect(GRACE_MINUTES).toBeGreaterThan(0);
    expect(GRACE_MINUTES).toBeLessThanOrEqual(60);
  });
});
