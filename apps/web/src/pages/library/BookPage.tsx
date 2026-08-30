import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentUserActions } from "@/components/shared/ContentUserActions";
import { libraryApi } from "@/features/library/api";
import { useStreakPing } from "@/features/streaks/useStreak";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function BookPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  useStreakPing();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["library", "book", slug],
    queryFn: () => libraryApi.getBook(slug!),
    enabled: Boolean(slug),
  });
  useDocumentTitle(data?.title);

  if (!slug) return <Navigate to="/library" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: t("library.title"), href: "/library" }, ...(data ? [{ label: data.title }] : [])]}
      />

      {isError && <p className="text-sm text-destructive">{t("library.errorDetail")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <h1 className="mb-1 text-xl font-semibold">{data.title}</h1>
          {data.author && (
            <p className="mb-3 text-sm text-muted-foreground">
              {data.author.name}
              {data.author.era ? ` - ${data.author.era}` : ""}
            </p>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {data.categories.map((c) => (
              <Badge key={c.id} variant="secondary">
                {c.name}
              </Badge>
            ))}
            {data.era && <Badge variant="outline">{data.era}</Badge>}
            {data.publicDomain && <Badge variant="outline">{t("library.publicDomain")}</Badge>}
          </div>

          <ContentUserActions targetType="book" targetId={data.id} className="mb-4" />

          {data.description && <p className="mb-6 text-sm leading-relaxed">{data.description}</p>}

          {data.author?.bio && (
            <section className="mb-6">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("library.about")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{data.author.bio}</p>
            </section>
          )}

          {data.externalUrl && (
            <a
              href={data.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
            >
              {t("library.readExternal")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {!data.externalUrl && <p className="text-sm text-muted-foreground">{t("library.noExternalLink")}</p>}
        </>
      )}
    </div>
  );
}
