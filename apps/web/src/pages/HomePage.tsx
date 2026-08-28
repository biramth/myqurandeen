import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  ScrollText,
  BookMarked,
  Scale,
  Landmark,
  History,
  GraduationCap,
  Library,
  Route,
  Search,
  Users,
  Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const CATEGORY_ICONS = {
  quran: BookOpen,
  hadith: ScrollText,
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
  useDocumentTitle();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  const categories = Object.keys(CATEGORY_ICONS) as (keyof typeof CATEGORY_ICONS)[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("home.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("home.subtitle")}</p>
      </div>

      <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("home.searchPlaceholder")}
            className="ps-9"
            aria-label={t("nav.search")}
          />
        </div>
        <Button type="submit">{t("home.searchButton")}</Button>
      </form>

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
