import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbList,
  buildOgImage,
  serializeJsonLd,
  SITE_URL,
  withShareUtm,
} from "@/components/shared/PageMeta";

describe("withShareUtm", () => {
  it("appose les parametres UTM sans toucher aux parametres existants", () => {
    const url = withShareUtm("https://myqurandeen.vercel.app/quran/2/255", "content");
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/quran/2/255");
    expect(parsed.searchParams.get("utm_source")).toBe("share");
    expect(parsed.searchParams.get("utm_medium")).toBe("content");
    expect(parsed.searchParams.get("utm_campaign")).toBe("content_share");
  });

  it("conserve une query string preexistante", () => {
    const url = withShareUtm("https://myqurandeen.vercel.app/hadith/42?referrer=home", "series");
    const parsed = new URL(url);
    expect(parsed.searchParams.get("referrer")).toBe("home");
    expect(parsed.searchParams.get("utm_medium")).toBe("series");
  });

  it("ecrase une valeur UTM existante plutot que de la dupliquer", () => {
    const url = withShareUtm("https://myqurandeen.vercel.app/dua?utm_source=other", "dua");
    const parsed = new URL(url);
    expect(parsed.searchParams.get("utm_source")).toBe("share");
  });
});

describe("buildOgImage", () => {
  it("retourne une URL sur le endpoint /api/og avec encodage query", () => {
    const url = buildOgImage({ title: "Verset 2:255", arabicText: "الْحَمْدُ لِلَّهِ" });
    expect(url.startsWith(`${SITE_URL}/api/og?`)).toBe(true);
    const parsed = new URL(url);
    expect(parsed.searchParams.get("title")).toBe("Verset 2:255");
    expect(parsed.searchParams.get("arabic")).toBe("الْحَمْدُ لِلَّهِ");
  });

  it("inclut tous les champs optionnels fournis", () => {
    const url = buildOgImage({
      title: "t",
      arabicText: "a",
      transliteration: "tr",
      body: "b",
      source: "s",
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("title")).toBe("t");
    expect(parsed.searchParams.get("arabic")).toBe("a");
    expect(parsed.searchParams.get("transliteration")).toBe("tr");
    expect(parsed.searchParams.get("body")).toBe("b");
    expect(parsed.searchParams.get("source")).toBe("s");
  });

  it("omet les champs vides / optionnels absents", () => {
    const url = buildOgImage({});
    const parsed = new URL(url);
    expect(parsed.searchParams.toString()).toBe("");
    expect(parsed.pathname).toBe("/api/og");
  });
});

describe("buildBreadcrumbList", () => {
  it("construit une liste ListItem positionnee de 1..n avec URLs absolues", () => {
    const list = buildBreadcrumbList([
      { name: "Accueil", path: "/" },
      { name: "Coran", path: "/quran" },
      { name: "Al-Baqarah 255", path: "/quran/2/255" },
    ]);
    expect(list["@type"]).toBe("BreadcrumbList");
    const items = list.itemListElement as { position: number; name: string; item: string }[];
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({ "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` });
    expect(items[1]).toEqual({ "@type": "ListItem", position: 2, name: "Coran", item: `${SITE_URL}/quran` });
    expect(items[2]).toEqual({ "@type": "ListItem", position: 3, name: "Al-Baqarah 255", item: `${SITE_URL}/quran/2/255` });
  });
});

describe("serializeJsonLd", () => {
  it("prefixe context schema.org et echappe < pour ne pas casser </script>", () => {
    const json = serializeJsonLd({ "@type": "Article", headline: "a < b" });
    expect(json).toContain('"@context":"https://schema.org"');
    expect(json).toContain('"@type":"Article"');
    // le "<" est echappe en unicode, pas laisse brut
    expect(json).toContain("\\u003c");
    expect(json).not.toContain("</script>");
  });
});
