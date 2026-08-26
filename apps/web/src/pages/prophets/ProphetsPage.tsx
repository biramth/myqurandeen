import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { prophetsApi } from "@/features/prophets/api";

export function ProphetsPage() {
  const { t } = useTranslation();
  const { data: prophets, isLoading, isError } = useQuery({
    queryKey: ["prophets"],
    queryFn: prophetsApi.listProphets,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("prophets.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("prophets.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("prophets.error")}</p>}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {prophets?.map((prophet) => (
          <Link key={prophet.id} to={`/prophets/${prophet.slug}`}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardContent className="flex items-center justify-between gap-2 p-4">
                <p className="font-medium">{prophet.name}</p>
                {prophet.nameArabic && (
                  <span dir="rtl" className="font-arabic text-base text-muted-foreground">
                    {prophet.nameArabic}
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
