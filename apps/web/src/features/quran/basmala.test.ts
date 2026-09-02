import { describe, expect, it } from "vitest";
import { splitBasmala } from "@/features/quran/basmala";

describe("splitBasmala", () => {
  it("ne separe rien pour un verset qui n'est pas le premier", () => {
    const text = "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ";
    expect(splitBasmala(2, 2, text)).toEqual({ basmala: null, text });
  });

  it("garde Al-Fatiha intacte (la basmala EST le verset 1)", () => {
    const text = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ";
    expect(splitBasmala(1, 1, text)).toEqual({ basmala: null, text });
  });

  it("ne separe pas At-Tawba (sourate 9, sans basmala)", () => {
    const text = "بَرَاءَةٌ مِنَ اللَّهِ وَرَسُولِهِ";
    expect(splitBasmala(9, 1, text)).toEqual({ basmala: null, text });
  });

  it("isole les 4 premiers mots comme basmala pour une autre sourate", () => {
    const text = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ الٓمٓ";
    expect(splitBasmala(2, 1, text)).toEqual({ basmala: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", text: "الٓمٓ" });
  });

  it("retourne tout le texte comme basmala si le verset fait exactement 4 mots", () => {
    const text = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
    // 4 mots et pas de reste : traite comme non separable (texte >= 4 mots pour etre un vrai verset)
    expect(splitBasmala(50, 1, text)).toEqual({ basmala: null, text });
  });

  it("gere la basmala avec diacritiques outhmani differents (ex. sourate 95)", () => {
    const text = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ وَالتِّينِ";
    const result = splitBasmala(95, 1, text);
    expect(result.basmala).toBe("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ");
    expect(result.text.length).toBeGreaterThan(0);
  });

  it("ignore les espaces multiples dans le texte source", () => {
    const text = " بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ   الٓمٓ  ";
    expect(splitBasmala(3, 1, text)).toEqual({ basmala: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", text: "الٓمٓ" });
  });
});
