import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Scale, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { schoolsApi } from "@/features/schools/api";

export function SchoolsPage() {
  const { t } = useTranslation();
  const { data: schools, isLoading, isError } = useQuery({
    queryKey: ["schools"],
    queryFn: schoolsApi.listSchools,
  });

  const fiqhSchools = schools?.filter((s) => s.type === "fiqh") ?? [];
  const theologicalSchools = schools?.filter((s) => s.type === "theological") ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Scale className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("schools.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("schools.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("schools.error")}</p>}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      <Link to="/fiqh" className="mb-6 block">
        <Card className="border-primary/40 bg-accent/40 transition-colors hover:border-primary">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{t("schools.comparatorTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("schools.comparatorSubtitle")}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
          </CardContent>
        </Card>
      </Link>

      {fiqhSchools.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("schools.fiqhSchools")}
          </h2>
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fiqhSchools.map((school) => (
              <Link key={school.id} to={`/schools/${school.slug}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardContent className="p-4">
                    <p className="font-medium">{school.name}</p>
                    {school.era && <p className="text-sm text-muted-foreground">{school.era}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      {theologicalSchools.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("schools.theologicalSchools")}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {theologicalSchools.map((school) => (
              <Link key={school.id} to={`/schools/${school.slug}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{school.name}</p>
                      <Badge variant="secondary">{t("schools.theological")}</Badge>
                    </div>
                    {school.era && <p className="text-sm text-muted-foreground">{school.era}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
