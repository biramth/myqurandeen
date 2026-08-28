import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  WEB_URL: z.string().url().default("http://localhost:5173"),
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
