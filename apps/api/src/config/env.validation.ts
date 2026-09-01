import { z } from "zod";

/** Hotenames locaux : une URL vers ceux-ci ne doit jamais servir de base aux emails. */
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

function isLocalHost(url: string): boolean {
  try {
    return LOCAL_HOSTNAMES.has(new URL(url).hostname);
  } catch {
    return true;
  }
}

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    API_PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().url(),
    WEB_URL: z.string().url().default("http://localhost:5173"),
  // Origines CORS supplementaires (sep. par des virgules), en plus de WEB_URL.
  CORS_ORIGINS: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET doit faire au moins 16 caracteres"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET doit faire au moins 16 caracteres"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),

  // IA / RAG : AI_BACKEND choisit le provider actif ("AI_PROVIDER" designe
  // deja, en interne, le token d'injection NestJS - nom volontairement
  // different pour ne pas les confondre). "gemini" (API distante, gratuite
  // en usage modere) est le defaut actuel car l'hebergement local d'Ollama
  // demande plus de ressources que disponible pour l'instant. "ollama"
  // reste disponible pour revenir a un backend 100% local plus tard.
  AI_BACKEND: z.enum(["gemini", "ollama"]).default("gemini"),
  AI_EMBEDDING_DIM: z.coerce.number().int().positive().default(768),

  // Gemini (API distante)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_LLM_MODEL: z.string().default("gemini-3.6-flash"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),

  // Ollama (local, optionnel)
  OLLAMA_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_LLM_MODEL: z.string().default("qwen2.5:3b"),
  OLLAMA_EMBEDDING_MODEL: z.string().default("nomic-embed-text"),

  // Notifications push (rappels dua/lecture) - optionnelles : la
  // fonctionnalite se desactive silencieusement si absentes (voir
  // WebPushProvider). zod .object() ignore les cles non declarees ici, donc
  // elles DOIVENT figurer meme optionnelles pour rester lisibles via
  // ConfigService apres validation.
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),

  // Jeton secret partage avec le cron externe (cron-job.org, Render Cron
  // Job...) qui declenche POST /reminders/run. Exige un minimum de longueur
  // pour eviter une cle trivialement devinable qui permettrait d'envoyer des
  // notifications de masse a tous les abonnes sans permission.
  REMINDER_RUN_TOKEN: z.string().min(16, "REMINDER_RUN_TOKEN doit faire au moins 16 caracteres").optional(),

  // Emails (verification, reset de mot de passe) via Brevo - optionnels :
  // sans BREVO_API_KEY, l'envoi est simule et journalise (logs) plutot que
  // d'echouer, pour permettre le developpement sans cle.
  BREVO_API_KEY: z.string().optional(),
  // Format "Nom <email@domaine>" - doit correspondre a l'adresse expediteur
  // verifiee dans Brevo (verification par email, pas besoin de domaine).
  EMAIL_FROM: z
    .string()
    .regex(/^[^<]*<[^@\s]+@[^@\s]+\.[^@\s]+>$|^[^@\s]+@[^@\s]+\.[^@\s]+$/, "EMAIL_FROM doit etre 'Nom <email@domaine>' ou 'email@domaine'")
    .default("myqurandeen <no-reply@qurandeen.app>"),

  // Google OAuth ("Continuer avec Google") - optionnel : desactive tant que
  // GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET ne sont pas fournis.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional().default("http://localhost:3000/auth/google/callback"),

  // Duree de validite (en secondes) des jetons de verification email et de
  // reinitialisation de mot de passe.
  VERIFY_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  RESET_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  })
  .superRefine((env, ctx) => {
    // WEB_URL sert de base a tous les liens des emails (verification, reset,
    // de mot de passe, desabonnement) et au logo heberge : une valeur locale
    // produirait des emails avec des liens inutilisables. Le fallback
    // localhost convient au developpement, mais des qu'une cle Brevo est
    // configuree des emails reels peuvent partir : exiger une URL publique.
    if (env.BREVO_API_KEY && env.BREVO_API_KEY.trim()) {
      if (isLocalHost(env.WEB_URL)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["WEB_URL"],
          message:
            "WEB_URL doit etre une URL publique reelle des que BREVO_API_KEY est configuree (les emails contiennent des liens bases dessus). Ex. : WEB_URL=https://myqurandeen.vercel.app",
        });
      }
    }
    // En production, WEB_URL alimente aussi le CORS : une valeur locale
    // bloquerait silencieusement l'app en ligne.
    if (env.NODE_ENV === "production" && isLocalHost(env.WEB_URL)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["WEB_URL"],
        message: "WEB_URL doit etre l'URL publique de l'app en production (base des liens email et CORS).",
      });
    }
    // VAPID_SUBJECT est passe tel quel a `webpush.setVapidDetails()` qui
    // exige un mailto: ou une URL https - une valeur mal formee ferait
    // planter le demarrage de l'app (exception non rattrapee dans
    // WebPushProvider) au lieu d'etre simplement ignoree comme les deux
    // autres cles VAPID absentes.
    if (env.VAPID_SUBJECT && !/^mailto:|^https?:\/\//.test(env.VAPID_SUBJECT)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["VAPID_SUBJECT"],
        message: "VAPID_SUBJECT doit commencer par 'mailto:' ou 'https://' (exige par la librairie web-push).",
      });
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

/** Utilise par @nestjs/config (ConfigModule.forRoot({ validate })) : echoue vite si l'env est mal configure. */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Configuration d'environnement invalide:\n${issues}`);
  }
  return parsed.data;
}
