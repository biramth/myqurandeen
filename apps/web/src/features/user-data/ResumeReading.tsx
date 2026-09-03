import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/auth-context";
import { userDataApi } from "./api";

/**
 * "Reprendre o� j'en �tais" : affiche les 2-3 positions de lecture les plus
 * recentes de l'utilisateur connecte, chacune avec un lien direct vers le
 * contenu. Rend rien pour un visiteur anonyme ou sans historique.
 */
export function ResumeReading() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["user-data", "last-read"],
    queryFn: () => userDataApi.listLastRead(3),
    enabled: Boolean(user),
  });

  if (!user) return null;
  if (isLoading) {
    return (
      <Card className="mt-10">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-40" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <Card className="mt-10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span>{t("home.resumeReading.label")}</span>
        </div>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  to={item.href}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:border-primary/50"
                >
                  <span className="truncate">{item.title}</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                </Link>
              ) : (
                <span className="block rounded-md border px-3 py-2 text-sm text-muted-foreground">{item.title}</span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}