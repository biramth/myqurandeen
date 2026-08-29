import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HandHeart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { duasApi } from "@/features/duas/api";
import { getDuaCategoryIcon } from "@/features/duas/icons";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function DuaCategoriesPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("duas.title"));
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ["duas", "categories"],
    queryFn: duasApi.listCategories,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <HandHeart className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("duas.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("duas.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("duas.error")}</p>}
      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories?.map((category) => {
          const Icon = getDuaCategoryIcon(category.slug);
          return (
            <Link key={category.id} to={`/duas/${category.slug}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="flex items-start gap-3 p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                    )}
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
