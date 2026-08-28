import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import cookieParser from "cookie-parser";
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
  app.enableCors({
    origin: process.env.WEB_URL ?? "http://localhost:5173",
    credentials: true,
  });

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

  const port = process.env.API_PORT ?? 3000;
  await app.listen(port);
  console.log(`myQurandeen API demarree sur http://localhost:${port} (docs: /docs)`);
}

bootstrap();
