import { describe, expect, it } from "vitest";
import {
  daysRemainingInRamadan,
  getHijriDate,
  getRamadanBounds,
  getRamadanDay,
  gregorianToJdn,
  hijriToJdn,
  isRamadan,
  jdnToGregorianDate,
  jdnToHijri,
} from "@/features/ramadan/hijri-calendar";

describe("gregorianToJdn / jdnToHijri", () => {
  it("place l'epoque civile (1 Muharram an 1) au 16 juillet 622", () => {
    expect(jdnToHijri(1948440)).toEqual({ year: 1, month: 1, day: 1 });
  });

  it("retrouve une date de debut de Ramadan largement documentee (1447 AH -> 18 fevrier 2026)", () => {
    const jdn = gregorianToJdn(2026, 2, 18);
    expect(jdnToHijri(jdn)).toEqual({ year: 1447, month: 9, day: 1 });
  });

  it("retrouve le 1 Muharram 1447 AH (27 juin 2025)", () => {
    const jdn = gregorianToJdn(2025, 6, 27);
    expect(jdnToHijri(jdn)).toEqual({ year: 1447, month: 1, day: 1 });
  });
});

describe("hijriToJdn / jdnToGregorianDate (aller-retour)", () => {
  it("est l'exacte reciproque de gregorianToJdn/jdnToHijri sur une plage de dates", () => {
    const samples: Array<[number, number, number]> = [
      [2026, 9, 3],
      [2026, 2, 18],
      [2025, 6, 27],
      [2000, 1, 1],
      [1999, 12, 31],
      [2050, 3, 15],
    ];
    for (const [y, m, d] of samples) {
      const jdn = gregorianToJdn(y, m, d);
      const hijri = jdnToHijri(jdn);
      expect(hijriToJdn(hijri.year, hijri.month, hijri.day)).toBe(jdn);
    }
  });

  it("jdnToGregorianDate inverse gregorianToJdn", () => {
    const jdn = gregorianToJdn(2026, 9, 3);
    const date = jdnToGregorianDate(jdn);
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(8); // 0-indexe
    expect(date.getUTCDate()).toBe(3);
  });
});

describe("getHijriDate / isRamadan / getRamadanDay", () => {
  it("2026-09-03 n'est pas en Ramadan (Rabi al-Awwal, 3e mois hijri)", () => {
    const hijri = getHijriDate(new Date(Date.UTC(2026, 8, 3)));
    expect(hijri.year).toBe(1448);
    expect(isRamadan(hijri)).toBe(false);
    expect(getRamadanDay(new Date(Date.UTC(2026, 8, 3)))).toBeNull();
  });

  it("2026-02-18 est le 1er jour de Ramadan 1447", () => {
    const date = new Date(Date.UTC(2026, 1, 18));
    expect(isRamadan(getHijriDate(date))).toBe(true);
    expect(getRamadanDay(date)).toBe(1);
    expect(daysRemainingInRamadan(date)).toBe(30);
  });

  it("le dernier jour de Ramadan (30e) laisse 1 jour restant", () => {
    const { end } = getRamadanBounds(1447);
    expect(getRamadanDay(end)).toBe(30);
    expect(daysRemainingInRamadan(end)).toBe(1);
  });

  it("le mois de Ramadan compte toujours 30 jours (mois impair du calendrier tabulaire)", () => {
    const { start, end } = getRamadanBounds(1447);
    const diffDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    expect(diffDays).toBe(29); // 30 jours inclus = 29 jours d'ecart entre le 1er et le dernier
  });

  it("daysRemainingInRamadan et getRamadanDay renvoient null hors Ramadan", () => {
    const date = new Date(Date.UTC(2026, 5, 1)); // juin, hors Ramadan
    expect(getRamadanDay(date)).toBeNull();
    expect(daysRemainingInRamadan(date)).toBeNull();
  });
});
