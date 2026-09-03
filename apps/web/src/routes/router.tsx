import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ComingSoonPage } from "@/pages/ComingSoonPage";

const HomePage = React.lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const SurahListPage = React.lazy(() =>
  import("@/pages/quran/SurahListPage").then((m) => ({ default: m.SurahListPage })),
);
const SurahDetailPage = React.lazy(() =>
  import("@/pages/quran/SurahDetailPage").then((m) => ({ default: m.SurahDetailPage })),
);
const VersePage = React.lazy(() => import("@/pages/quran/VersePage").then((m) => ({ default: m.VersePage })));
const HadithCollectionsPage = React.lazy(() =>
  import("@/pages/hadith/HadithCollectionsPage").then((m) => ({ default: m.HadithCollectionsPage })),
);
const HadithCollectionPage = React.lazy(() =>
  import("@/pages/hadith/HadithCollectionPage").then((m) => ({ default: m.HadithCollectionPage })),
);
const HadithChapterPage = React.lazy(() =>
  import("@/pages/hadith/HadithChapterPage").then((m) => ({ default: m.HadithChapterPage })),
);
const HadithDetailPage = React.lazy(() =>
  import("@/pages/hadith/HadithDetailPage").then((m) => ({ default: m.HadithDetailPage })),
);
const TafsirWorksPage = React.lazy(() =>
  import("@/pages/tafsir/TafsirWorksPage").then((m) => ({ default: m.TafsirWorksPage })),
);
const HistoryPeriodsPage = React.lazy(() =>
  import("@/pages/history/HistoryPeriodsPage").then((m) => ({ default: m.HistoryPeriodsPage })),
);
const HistoryPeriodPage = React.lazy(() =>
  import("@/pages/history/HistoryPeriodPage").then((m) => ({ default: m.HistoryPeriodPage })),
);
const HistoryEventPage = React.lazy(() =>
  import("@/pages/history/HistoryEventPage").then((m) => ({ default: m.HistoryEventPage })),
);
const DuaCategoriesPage = React.lazy(() =>
  import("@/pages/duas/DuaCategoriesPage").then((m) => ({ default: m.DuaCategoriesPage })),
);
const DuaCategoryPage = React.lazy(() =>
  import("@/pages/duas/DuaCategoryPage").then((m) => ({ default: m.DuaCategoryPage })),
);
const SchoolsPage = React.lazy(() => import("@/pages/schools/SchoolsPage").then((m) => ({ default: m.SchoolsPage })));
const SchoolPage = React.lazy(() => import("@/pages/schools/SchoolPage").then((m) => ({ default: m.SchoolPage })));
const FiqhComparatorPage = React.lazy(() =>
  import("@/pages/schools/FiqhComparatorPage").then((m) => ({ default: m.FiqhComparatorPage })),
);
const FiqhTopicPage = React.lazy(() =>
  import("@/pages/schools/FiqhTopicPage").then((m) => ({ default: m.FiqhTopicPage })),
);
const ProphetsPage = React.lazy(() =>
  import("@/pages/prophets/ProphetsPage").then((m) => ({ default: m.ProphetsPage })),
);
const ProphetPage = React.lazy(() =>
  import("@/pages/prophets/ProphetPage").then((m) => ({ default: m.ProphetPage })),
);
const ConceptsPage = React.lazy(() =>
  import("@/pages/concepts/ConceptsPage").then((m) => ({ default: m.ConceptsPage })),
);
const ConceptPage = React.lazy(() =>
  import("@/pages/concepts/ConceptPage").then((m) => ({ default: m.ConceptPage })),
);
const ScholarsPage = React.lazy(() =>
  import("@/pages/scholars/ScholarsPage").then((m) => ({ default: m.ScholarsPage })),
);
const ScholarPage = React.lazy(() =>
  import("@/pages/scholars/ScholarPage").then((m) => ({ default: m.ScholarPage })),
);
const LearningPathsPage = React.lazy(() =>
  import("@/pages/learning/LearningPathsPage").then((m) => ({ default: m.LearningPathsPage })),
);
const LearningPathPage = React.lazy(() =>
  import("@/pages/learning/LearningPathPage").then((m) => ({ default: m.LearningPathPage })),
);
const LearningLessonPage = React.lazy(() =>
  import("@/pages/learning/LearningLessonPage").then((m) => ({ default: m.LearningLessonPage })),
);
const LearningQuizPage = React.lazy(() =>
  import("@/pages/learning/LearningQuizPage").then((m) => ({ default: m.LearningQuizPage })),
);
const PrayerTimesPage = React.lazy(() =>
  import("@/pages/PrayerTimesPage").then((m) => ({ default: m.PrayerTimesPage })),
);
const RamadanPage = React.lazy(() => import("@/pages/RamadanPage").then((m) => ({ default: m.RamadanPage })));
const LibraryPage = React.lazy(() => import("@/pages/library/LibraryPage").then((m) => ({ default: m.LibraryPage })));
const AboutPage = React.lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const EmbedDailyVersePage = React.lazy(() =>
  import("@/pages/EmbedDailyVersePage").then((m) => ({ default: m.EmbedDailyVersePage })),
);
const BookPage = React.lazy(() => import("@/pages/library/BookPage").then((m) => ({ default: m.BookPage })));
const AdminPage = React.lazy(() => import("@/pages/admin/AdminPage").then((m) => ({ default: m.AdminPage })));
const AssistantPage = React.lazy(() =>
  import("@/pages/ai/AssistantPage").then((m) => ({ default: m.AssistantPage })),
);
const SearchPage = React.lazy(() => import("@/pages/SearchPage").then((m) => ({ default: m.SearchPage })));
const LoginPage = React.lazy(() => import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() =>
  import("@/pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const VerifyEmailPage = React.lazy(() =>
  import("@/pages/auth/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })),
);
const ForgotPasswordPage = React.lazy(() =>
  import("@/pages/auth/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = React.lazy(() =>
  import("@/pages/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })),
);
const GoogleCallbackPage = React.lazy(() =>
  import("@/pages/auth/GoogleCallbackPage").then((m) => ({ default: m.GoogleCallbackPage })),
);
const ProfilePage = React.lazy(() => import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const UnsubscribePage = React.lazy(() =>
  import("@/pages/marketing/UnsubscribePage").then((m) => ({ default: m.UnsubscribePage })),
);

function PageFallback() {
  const { t } = useTranslation();
  return <div className="px-4 py-16 text-center text-sm text-muted-foreground">{t("common.loading")}</div>;
}

const COMING_SOON_ROUTES: { path: string; key: string; icon?: LucideIcon }[] = [];

function ComingSoonRoute({ i18nKey, icon }: { i18nKey: string; icon?: LucideIcon }) {
  const { t } = useTranslation();
  return <ComingSoonPage title={t(`comingSoon.${i18nKey}.title`)} description={t(`comingSoon.${i18nKey}.description`)} icon={icon} />;
}

export function AppRouter() {
  return (
    <React.Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/quran" element={<SurahListPage />} />
          <Route path="/quran/:surah" element={<SurahDetailPage />} />
          <Route path="/quran/:surah/:verse" element={<VersePage />} />

          <Route path="/hadith" element={<HadithCollectionsPage />} />
          <Route path="/hadith/:collection" element={<HadithCollectionPage />} />
          <Route path="/hadith/:collection/book/:bookNumber" element={<HadithChapterPage />} />
          <Route path="/hadith/:collection/:number" element={<HadithDetailPage />} />

          <Route path="/tafsir" element={<TafsirWorksPage />} />

          <Route path="/duas" element={<DuaCategoriesPage />} />
          <Route path="/duas/:slug" element={<DuaCategoryPage />} />

          <Route path="/prayer-times" element={<PrayerTimesPage />} />
          <Route path="/ramadan" element={<RamadanPage />} />

          <Route path="/history" element={<HistoryPeriodsPage />} />
          <Route path="/history/event/:slug" element={<HistoryEventPage />} />
          <Route path="/history/:period" element={<HistoryPeriodPage />} />

          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/schools/:slug" element={<SchoolPage />} />
          <Route path="/fiqh" element={<FiqhComparatorPage />} />
          <Route path="/fiqh/:slug" element={<FiqhTopicPage />} />

          <Route path="/prophets" element={<ProphetsPage />} />
          <Route path="/prophets/:slug" element={<ProphetPage />} />

          <Route path="/concepts" element={<ConceptsPage />} />
          <Route path="/concepts/:slug" element={<ConceptPage />} />

          <Route path="/scholars" element={<ScholarsPage />} />
          <Route path="/scholars/:slug" element={<ScholarPage />} />

          <Route path="/learn" element={<LearningPathsPage />} />
          <Route path="/learn/:slug" element={<LearningPathPage />} />
          <Route path="/learn/:slug/quiz" element={<LearningQuizPage />} />
          <Route path="/learn/:slug/lessons/:order" element={<LearningLessonPage />} />

          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:slug" element={<BookPage />} />

          <Route path="/about" element={<AboutPage />} />

          <Route path="/admin" element={<AdminPage />} />

          <Route path="/assistant" element={<AssistantPage />} />

          <Route path="/search" element={<SearchPage />} />

          {COMING_SOON_ROUTES.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<ComingSoonRoute i18nKey={route.key} icon={route.icon} />}
            />
          ))}

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/oauth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/desabonnement" element={<UnsubscribePage />} />

          <Route path="*" element={<ComingSoonRoute i18nKey="notFound" />} />
        </Route>

        {/* Hors AppLayout (pas de sidebar/header/footer/nav) : concu pour tourner
            dans une <iframe> sur un site tiers, voir EmbedDailyVersePage. */}
        <Route path="/embed/daily-verse" element={<EmbedDailyVersePage />} />
      </Routes>
    </React.Suspense>
  );
}
