import { SITE_URL, escapeXml, formatDate, toIndexXml, toXml } from "./sitemap-xml";

describe("escapeXml", () => {
  it("echappe les cinq caracteres XML", () => {
    const input = `&<>"'`;
    expect(escapeXml(input)).toBe("&amp;&lt;&gt;&quot;&apos;");
  });

  it("laisse un slug simple inchange", () => {
    expect(escapeXml("/quran/2/255")).toBe("/quran/2/255");
  });
});

describe("formatDate", () => {
  it("retourne YYYY-MM-DD depuis un Date", () => {
    expect(formatDate(new Date("2026-09-03T12:30:00Z"))).toBe("2026-09-03");
  });

  it("retourne null pour null/undefined", () => {
    expect(formatDate(null)).toBeNull();
    expect(formatDate(undefined)).toBeNull();
  });

  it("retourne null pour une date invalide", () => {
    expect(formatDate("pas-une-date")).toBeNull();
  });
});

describe("toXml", () => {
  it("produit un urlset valide avec loc absolu et lastmod optionnel", () => {
    const xml = toXml([
      { loc: "/quran/2/255", lastmod: "2026-09-03" },
      { loc: "/concepts/salah" },
    ]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
    expect(xml).toContain(`<loc>${SITE_URL}/quran/2/255</loc>`);
    expect(xml).toContain("<lastmod>2026-09-03</lastmod>");
    expect(xml).toContain(`<loc>${SITE_URL}/concepts/salah</loc>`);
    // pas de lastmod sur l'URL sans date
    expect(xml).not.toContain("lastmod</lastmod>");
  });

  it("echappe les caracteres reserves dans les loc", () => {
    const xml = toXml([{ loc: "/hadith/a&b" }]);
    expect(xml).toContain("/hadith/a&amp;b");
  });
});

describe("toIndexXml", () => {
  it("produit un sitemapindex pointant vers les sous-sitemaps", () => {
    const xml = toIndexXml(["/sitemap-data/static.xml", "/sitemap-data/quran.xml"]);
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain(`<loc>${SITE_URL}/sitemap-data/static.xml</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}/sitemap-data/quran.xml</loc>`);
    expect(xml).toContain("</sitemapindex>");
  });
});
