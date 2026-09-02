import { describe, expect, it } from "vitest";
import {
  computePrayerTimes,
  computeQiblaDirection,
  DEFAULT_PRAYER_CALCULATION_METHOD,
  nextPrayer,
  PRAYER_NAMES,
} from "@/features/prayer-times/prayer-times";

// Coordonnees de La Mecque (Kaaba).
const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

describe("computePrayerTimes", () => {
  const times = computePrayerTimes(MECCA_LAT, MECCA_LNG, new Date("2026-06-21T12:00:00Z"), "MuslimWorldLeague");

  it("retourne les 5 prieres + le lever du soleil comme des dates valides", () => {
    for (const name of PRAYER_NAMES) {
      expect(times[name]).toBeInstanceOf(Date);
      expect(Number.isNaN(times[name].getTime())).toBe(false);
    }
    expect(times.sunrise).toBeInstanceOf(Date);
    expect(Number.isNaN(times.sunrise.getTime())).toBe(false);
  });

  it("respecte l'ordre chronologique fajr < sunrise < dhuhr < asr < maghrib < isha", () => {
    const order = [
      times.fajr.getTime(),
      times.sunrise.getTime(),
      times.dhuhr.getTime(),
      times.asr.getTime(),
      times.maghrib.getTime(),
      times.isha.getTime(),
    ];
    for (let i = 1; i < order.length; i++) {
      expect(order[i]).toBeGreaterThan(order[i - 1]);
    }
  });

  it("est deterministe pour une meme position/date/methode", () => {
    const a = computePrayerTimes(MECCA_LAT, MECCA_LNG, new Date("2026-06-21T12:00:00Z"), "MuslimWorldLeague");
    const b = computePrayerTimes(MECCA_LAT, MECCA_LNG, new Date("2026-06-21T12:00:00Z"), "MuslimWorldLeague");
    for (const name of [...PRAYER_NAMES, "sunrise"] as const) {
      expect(a[name].getTime()).toBe(b[name].getTime());
    }
  });

  it("utilise la methode par defaut quand elle n'est pas fournie", () => {
    const explicit = computePrayerTimes(MECCA_LAT, MECCA_LNG, new Date("2026-06-21T12:00:00Z"), "MuslimWorldLeague");
    const implicit = computePrayerTimes(MECCA_LAT, MECCA_LNG, new Date("2026-06-21T12:00:00Z"));
    expect(implicit.fajr.getTime()).toBe(explicit.fajr.getTime());
    expect((DEFAULT_PRAYER_CALCULATION_METHOD as string).length).toBeGreaterThan(0);
  });
});

describe("computeQiblaDirection", () => {
  it("renvoie un cap dans [0, 360) pour un lieu quelconque", () => {
    const direction = computeQiblaDirection(48.85, 2.35); // Paris
    expect(direction).toBeGreaterThanOrEqual(0);
    expect(direction).toBeLessThan(360);
  });

  it("vaut ~0 (nord) depuis un point exactement au sud de la Kaaba sur le meme meridien", () => {
    const southLat = MECCA_LAT - 50;
    const direction = computeQiblaDirection(southLat, MECCA_LNG);
    // Difference angulaire minimale (le nord vrai peut etre rendu 359.999... ~ 0).
    const diff = Math.abs(direction - 0) > 180 ? 360 - Math.abs(direction - 0) : Math.abs(direction - 0);
    expect(diff < 1).toBe(true);
  });

  it("vaut ~180 (sud) depuis un point exactement au nord de la Kaaba sur le meme meridien", () => {
    const northLat = MECCA_LAT + 50;
    const direction = computeQiblaDirection(northLat, MECCA_LNG);
    expect(Math.abs(direction - 180) < 1).toBe(true);
  });
});

describe("nextPrayer", () => {
  it("retourne la priere suivante dans la journee quand elle n'est pas encore passee", () => {
    const now = new Date("2026-06-21T02:00:00Z");
    const { name, time } = nextPrayer(MECCA_LAT, MECCA_LNG, "MuslimWorldLeague", now);
    expect(PRAYER_NAMES).toContain(name);
    expect(time.getTime()).toBeGreaterThan(now.getTime());
  });

  it("ne renvoie jamais le lever du soleil (ce n'est pas une priere)", () => {
    const now = new Date("2026-06-21T05:00:00Z");
    const { name } = nextPrayer(MECCA_LAT, MECCA_LNG, "MuslimWorldLeague", now);
    expect(name).not.toBe("sunrise");
  });

  it("bascule sur le fajr du lendemain apres isha", () => {
    // Tres tard dans la journee : toutes les prieres du jour sont passees.
    const now = new Date("2026-06-21T23:30:00Z");
    const today = computePrayerTimes(MECCA_LAT, MECCA_LNG, now, "MuslimWorldLeague");
    const allPassed = PRAYER_NAMES.every((n) => today[n].getTime() < now.getTime());
    expect(allPassed).toBe(true);
    const { name, time } = nextPrayer(MECCA_LAT, MECCA_LNG, "MuslimWorldLeague", now);
    expect(name).toBe("fajr");
    expect(time.getTime()).toBeGreaterThan(now.getTime());
  });
});
