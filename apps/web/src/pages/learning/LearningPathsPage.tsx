import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Route as RouteIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { learningApi } from "@/features/learning/api";
import { PageMeta } from "@/components/shared/PageMeta";

const LEVEL_KEYS = { beginner: "learning.beginner", intermediate: "learning.intermediate", advanced: "learning.advanced" } as const;

export function LearningPathsPage() {
  const { t } = useTranslation();
  const { data: paths, isLoading, isError } = useQuery({
    queryKey: ["learning", "paths"],
    queryFn: learningApi.listPaths,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta title={t("learning.title")} description={t("learning.subtitle")} />
      <div className="mb-8 flex items-center gap-3">
        <RouteIcon className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("learning.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("learning.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("learning.error")}</p>}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {paths?.map((path) => (
          <Link key={path.id} to={`/learn/${path.slug}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-medium">{path.title}</p>
                  <Badge variant="secondary">{t(LEVEL_KEYS[path.level])}</Badge>
                </div>
                {path.description && <p className="text-sm text-muted-foreground">{path.description}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
