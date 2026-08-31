// les imports satori/sharp sont DYNAMIQUES (a l'interieur du handler, dans
// le try) : si un import echoue au chargement (ex. asset wasm de harfbuzz ou
// binding natif de sharp mal bundle), l'erreur est capturee et renvoyee en
// clair au lieu d'un "FUNCTION_INVOCATION_FAILED" a l'import top-level.

// Runtime NODE, pas edge : @vercel/og (et sa couche wasm resvg/yoga) ne se
// bundle pas proprement dans une fonction du dossier api/ (erreur de deploy
// "unsupported modules: @vercel: module" - voir historique). Ici on evite le
// paquet wrapper : satori generent le SVG (avec la police arabe), sharp le
// convertit en PNG - deux bibliotheques fiables en runtime nodejs serverless.
export const config = { runtime: "nodejs" };

// IMPORTANT : utiliser le WOFF, pas le WOFF2. Le parseur de police embarque
// dans Satori (@shuding/opentype.js) ne lit pas le format WOFF2 ("Unsupported
// OpenType signature wOF2") ; le WOFF, lui, fonctionne.
const FONT_URL = "https://myqurandeen.vercel.app/fonts/amiri-arabic-400-normal.woff";
let fontCache: ArrayBuffer | undefined;

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Logo "BookOpen" lucide, embarque en SVG data-URI (pas de fetch externe) pour
// la ligne de marque en bas de carte - meme langage visuel que l'app. Satori
// rend les <img> en SVG inline via data URI, sans police emoji (qui serait du tofu).
const BOOK_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 7v14'/><path d='M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'/></svg>",
  );

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  fontCache = await res.arrayBuffer();
  return fontCache;
}

function decode(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const decoded = decodeURIComponent(value);
    return decoded.length > 0 ? decoded : undefined;
  } catch {
    return value;
  }
}

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function Card({
  hasArabic,
  arabic,
  transliteration,
  title,
  body,
  source,
}: {
  hasArabic: boolean;
  arabic: string;
  transliteration?: string;
  title: string;
  body?: string;
  source?: string;
}) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 80,
        background: "linear-gradient(160deg, #1d726b 0%, #123f3b 100%)",
        color: "#ffffff",
        fontFamily: hasArabic ? "arabic" : "system-ui",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 14,
        }}
      >
        {hasArabic && (
          <div style={{ display: "flex", direction: "rtl", color: "#ffffff", fontWeight: 700, fontSize: 56, lineHeight: 1.7 }}>
            {arabic}
          </div>
        )}
        {transliteration && (
          <div style={{ display: "flex", color: "rgba(255,255,255,0.8)", fontSize: 30, fontStyle: "italic", lineHeight: 1.5 }}>
            {transliteration}
          </div>
        )}
        {!hasArabic && (
          <div style={{ display: "flex", color: "#ffffff", fontWeight: 700, fontSize: 48, lineHeight: 1.3 }}>{title}</div>
        )}
        {body && (
          <div style={{ display: "flex", color: "rgba(255,255,255,0.92)", fontWeight: 500, fontSize: 28, lineHeight: 1.5 }}>
            {body}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 20 }}>
        {source && (
          <>
            <div style={{ display: "flex", width: 80, height: 1, background: "rgba(255,255,255,0.25)" }} />
            <div style={{ display: "flex", color: "rgba(255,255,255,0.7)", fontSize: 22, fontWeight: 500, textAlign: "center" }}>
              {source}
            </div>
          </>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 26 }}>
          <img src={BOOK_ICON} width={34} height={34} />
          myQurandeen
        </div>
        <div style={{ display: "flex", color: "rgba(255,255,255,0.5)", fontSize: 16 }}>myqurandeen.vercel.app</div>
      </div>
    </div>
  );
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const title = decode(url.searchParams.get("title")) ?? "";
  const arabicText = truncate(decode(url.searchParams.get("arabic")) ?? "", 500);
  const transliteration = truncate(decode(url.searchParams.get("transliteration")) ?? "", 400);
  const body = truncate(decode(url.searchParams.get("body")) ?? "", 400);
  const source = decode(url.searchParams.get("source"));

  const hasArabic = ARABIC_REGEX.test(arabicText.trim());

  try {
    const fontData = hasArabic ? await loadFont() : undefined;

    const [{ default: satori }, { default: sharp }] = await Promise.all([
      import("satori"),
      import("sharp"),
    ]);

    const svg = await satori(
      Card({ hasArabic, arabic: arabicText, transliteration, title, body, source }),
      {
        width: 1200,
        height: 630,
        fonts:
          fontData && hasArabic
            ? [{ name: "arabic", data: fontData, weight: 400, style: "normal" }]
            : [],
      },
    );

    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[og] generation error", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`Erreur generation image OG: ${message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
