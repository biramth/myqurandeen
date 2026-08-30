import path from "node:path";
import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { validateEnv } from "./config/env.validation";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";
import { DatabaseModule } from "./database/database.module";

import { HealthModule } from "./modules/health/health.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { QuranModule } from "./modules/quran/quran.module";
import { ProphetsModule } from "./modules/prophets/prophets.module";

import { SourcesModule } from "./modules/sources/sources.module";
import { TafsirModule } from "./modules/tafsir/tafsir.module";
import { HadithModule } from "./modules/hadith/hadith.module";
import { SchoolsModule } from "./modules/schools/schools.module";
import { ScholarsModule } from "./modules/scholars/scholars.module";
import { HistoryModule } from "./modules/history/history.module";
import { ConceptsModule } from "./modules/concepts/concepts.module";
import { DuasModule } from "./modules/duas/duas.module";
import { LibraryModule } from "./modules/library/library.module";
import { LearningModule } from "./modules/learning/learning.module";
import { SearchModule } from "./modules/search/search.module";
import { UserDataModule } from "./modules/user-data/user-data.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { FiqhSuggestionsModule } from "./modules/fiqh-suggestions/fiqh-suggestions.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AuditLogModule } from "./modules/audit-log/audit-log.module";
import { AiModule } from "./modules/ai/ai.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { RemindersModule } from "./modules/reminders/reminders.module";
import { MailModule } from "./modules/mail/mail.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // En dev, `nest start` s'execute avec cwd = apps/api : on pointe explicitement
      // vers le .env a la racine du monorepo. En production (Docker), ce fichier
      // n'existe pas et les variables viennent directement de l'environnement -
      // @nestjs/config ignore silencieusement un envFilePath absent.
      envFilePath: path.resolve(__dirname, "../../../.env"),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    ScheduleModule.forRoot(),
    // JwtModule est importe ici aussi car JwtAuthGuard (APP_GUARD global,
    // instancie dans le contexte d'AppModule) a besoin de JwtService.
    JwtModule.register({}),
    DatabaseModule,

    HealthModule,
    RbacModule,
    UsersModule,
    AuthModule,
    QuranModule,
    ProphetsModule,

    SourcesModule,
    TafsirModule,
    HadithModule,
    SchoolsModule,
    ScholarsModule,
    HistoryModule,
    ConceptsModule,
    DuasModule,
    LibraryModule,
    LearningModule,
    SearchModule,
    UserDataModule,
    ReportsModule,
    FiqhSuggestionsModule,
    AdminModule,
    AuditLogModule,
    AiModule,
    NotificationsModule,
    RemindersModule,
    MailModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
