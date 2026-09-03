import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ScrollText,
  BookMarked,
  HandHeart,
  Scale,
  Landmark,
  History,
  GraduationCap,
  Library,
  Route,
  Users,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBox } from "@/components/shared/SearchBox";
import { PageMeta, buildOgImage } from "@/components/shared/PageMeta";
import { DailyContentSection } from "@/features/daily/DailyContentSection";
import { dailyApi } from "@/features/daily/api";
import { ResumeReading } from "@/features/user-data/ResumeReading";
import { RamadanBanner } from "@/features/ramadan/RamadanBanner";

const CATEGORY_ICONS = {
  quran: BookOpen,
  hadith: ScrollText,
  duas: HandHeart,
  tafsir: BookMarked,
  fiqh: Scale,
  prophet: Landmark,
  prophets: Users,
  history: History,
  scholars: GraduationCap,
  library: Library,
  learning: Route,
  concepts: Lightbulb,
} as const;

const CATEGORY_HREFS: Record<keyof typeof CATEGORY_ICONS, string> = {
  quran: "/quran",
  hadith: "/hadith",
  duas: "/duas",
  tafsir: "/tafsir",
  fiqh: "/schools",
  prophet: "/history/vie-du-prophete",
  prophets: "/prophets",
  history: "/history",
  scholars: "/scholars",
  library: "/library",
  learning: "/learn",
  concepts: "/concepts",
};

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");

  // Meme cle de requete que DailyContentSection : React Query mutualise
  // l'appel reseau, ceci ne sert qu'a alimenter l'image OG dynamique de la
  // page d'accueil (fraicheur perçue par les crawlers/reseaux sociaux).
  const { data: daily } = useQuery({
    queryKey: ["daily"],
    queryFn: dailyApi.get,
    staleTime: 30 * 60 * 1000,
  });

  const handleSearch = (submitted: string) => {
    navigate(submitted ? `/search?q=${encodeURIComponent(submitted)}` : "/search");
  };

  const categories = Object.keys(CATEGORY_ICONS) as (keyof typeof CATEGORY_ICONS)[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <PageMeta
        title={null}
        description={t("home.subtitle")}
        image={
          daily?.verse
            ? buildOgImage({
                title: `${daily.verse.surahNameTransliterated} ${daily.verse.numberInSurah}`,
                arabicText: daily.verse.textArabic,
                transliteration: daily.verse.textTransliterated ?? undefined,
                body: daily.verse.translation?.text,
                source: `${daily.verse.surahNameTransliterated} — ${daily.verse.numberInSurah}`,
              })
            : undefined
        }
      />
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("home.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("home.subtitle")}</p>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        <SearchBox value={query} onChange={setQuery} onSubmit={handleSearch} />
      </div>

      <DailyContentSection />

      <RamadanBanner />

      <ResumeReading />

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((key) => {
          const Icon = CATEGORY_ICONS[key];
          return (
            <Link key={key} to={CATEGORY_HREFS[key]}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="flex flex-col items-start gap-2 p-4">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{t(`home.categories.${key}.label`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`home.categories.${key}.description`)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
