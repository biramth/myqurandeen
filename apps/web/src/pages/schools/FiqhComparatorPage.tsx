import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { schoolsApi } from "@/features/schools/api";
import type { FiqhTopicSummary } from "@/features/schools/types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { SuggestFiqhQuestionButton } from "@/features/fiqh-suggestions/SuggestFiqhQuestionButton";

// Ordre de lecture privilegie (culte puis transactions) plutot que l'ordre
// d'insertion en base, qui melangeait les categories au fil des ajouts
// successifs de sujets. Toute categorie non listee ici (ajout futur) atterrit
// simplement a la fin, par ordre alphabetique.
const CATEGORY_ORDER = [
  "Prière (Salat)",
  "Purification (Tahara)",
  "Jeûne (Sawm)",
  "Zakat",
  "Mariage (Nikah)",
  "Commerce et transactions (Mu'amalat)",
  "Hajj et 'Umra",
];

function groupByCategory(topics: FiqhTopicSummary[]): [string, FiqhTopicSummary[]][] {
  const groups = new Map<string, FiqhTopicSummary[]>();
  for (const topic of topics) {
    const key = topic.category ?? "";
    const list = groups.get(key);
    if (list) list.push(topic);
    else groups.set(key, [topic]);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function FiqhComparatorPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("schools.comparatorTitle"));
  const { data: topics, isLoading, isError } = useQuery({
    queryKey: ["schools", "fiqh-topics"],
    queryFn: schoolsApi.listFiqhTopics,
  });
  const groupedTopics = topics ? groupByCategory(topics) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/schools">
          <ArrowLeft className="h-4 w-4" />
          {t("schools.backToSchools")}
        </Link>
      </Button>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Scale className="h-7 w-7 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("schools.comparatorTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("schools.comparatorSubtitle")}</p>
          </div>
        </div>
        <SuggestFiqhQuestionButton />
      </div>

      {isError && <p className="text-sm text-destructive">{t("schools.error")}</p>}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      <div className="space-y-8">
        {groupedTopics.map(([category, categoryTopics]) => (
          <section key={category || "uncategorized"}>
            {category && (
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {category}
              </h2>
            )}
            <div className="space-y-3">
              {categoryTopics.map((topic) => (
                <Link key={topic.id} to={`/fiqh/${topic.slug}`}>
                  <Card className="transition-colors hover:border-primary/50">
                    <CardContent className="p-4">
                      <p className="font-medium">{topic.title}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
