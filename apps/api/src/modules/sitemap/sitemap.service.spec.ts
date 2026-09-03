import { Test } from "@nestjs/testing";
import { DRIZZLE } from "../../database/database.constants";
import { SitemapService } from "./sitemap.service";
import { SITEMAP_PART_PATHS } from "./sitemap-xml";

describe("SitemapService.generateIndex", () => {
  it("retourne un sitemap index qui refere chaque sous-sitemap sans toucher la base", async () => {
    // generateIndex n'utilise aucune requete DB : on passe d'indulgence un mock
    // vide, seule la mise en forme XML compte ici.
    const service = new SitemapService({} as never);
    const xml = await service.generateIndex();
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("</sitemapindex>");
    for (const path of SITEMAP_PART_PATHS) {
      expect(xml).toContain(`<loc>https://myqurandeen.vercel.app${path}</loc>`);
    }
    // Chaque sous-sitemap est referencie exactement une fois.
    expect(xml.match(/<sitemap>/g)?.length).toBe(SITEMAP_PART_PATHS.length);
  });
});
