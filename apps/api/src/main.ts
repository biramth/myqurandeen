import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Necessaire derriere tout reverse proxy (nginx, Railway, Render,
  // Vercel...) : sans ca, req.ip renvoie toujours l'IP du proxy plutot que
  // celle du client reel, ce qui casse a la fois le rate limiting (tous les
  // utilisateurs partagent alors la meme IP apparente) et le champ ip du
  // journal d'audit.
  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  app.use(helmet());
  app.use(cookieParser());
  // Compresse les reponses (gzip) - notamment utile pour les listes de
  // versets/hadiths/traductions qui peuvent peser plusieurs dizaines de Ko en
  // JSON brut.
  app.use(compression());

  // Origins autorisees (CORS). En production le frontend (Vercel) est sur un
  // domaine different de l'API (Render) : on autorise explicitement WEB_URL
  // puis toute origine supplementaire lister dans CORS_ORIGINS (sep. par des
  // virgules). On garde toujours localhost en dev.
  const corsOrigins = buildCorsOrigins();
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Requetes sans origine (curl, cron, paquets... ) ou origine autorisee.
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origine non autorisee par CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Verifie que l'adresse d'origine demandee figure bien dans la liste
  // autorisee ; sinon la retire. Au boot on loggue la liste finale.
  function buildCorsOrigins(): string[] {
    const fromVar =
      process.env.CORS_ORIGINS?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? [];
    const origins = new Set<string>();
    for (const o of [...fromVar, process.env.WEB_URL ?? "http://localhost:5173"]) {
      if (o) origins.add(o.replace(/\/+$/, ""));
    }
    console.log(`CORS autorise: ${[...origins].join(", ")}`);
    return [...origins];
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("myQurandeen API")
    .setDescription("API de la plateforme d'etude de l'Islam myQurandeen")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = process.env.API_PORT ?? process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`myQurandeen API demarree sur http://localhost:${port} (docs: /docs)`);
}

bootstrap();
