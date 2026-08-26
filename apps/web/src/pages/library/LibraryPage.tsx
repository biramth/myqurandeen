import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Library } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { libraryApi } from "@/features/library/api";
import type { LibraryBookSummary } from "@/features/library/types";

export function LibraryPage() {
  const { t } = useTranslation();
  const { data: books, isLoading, isError } = useQuery({
    queryKey: ["library", "books"],
    queryFn: libraryApi.listBooks,
  });

  const groups = React.useMemo(() => {
    if (!books) return [];
    const byCategory = new Map<string, LibraryBookSummary[]>();
    for (const book of books) {
      const categoryNames = book.categories.length > 0 ? book.categories.map((c) => c.name) : [t("library.other")];
      for (const name of categoryNames) {
        const list = byCategory.get(name) ?? [];
        list.push(book);
        byCategory.set(name, list);
      }
    }
    return Array.from(byCategory.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [books, t]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Library className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("library.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("library.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("library.error")}</p>}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {books && books.length === 0 && <p className="text-sm text-muted-foreground">{t("library.empty")}</p>}

      {groups.map(([categoryName, categoryBooks]) => (
        <section key={categoryName} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {categoryName}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categoryBooks.map((book) => (
              <Link key={book.id} to={`/library/${book.slug}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardContent className="p-4">
                    <p className="font-medium">{book.title}</p>
                    {book.authorName && <p className="text-sm text-muted-foreground">{book.authorName}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {book.era && (
                        <Badge variant="secondary" className="text-[10px]">
                          {book.era}
                        </Badge>
                      )}
                      {book.publicDomain && (
                        <Badge variant="secondary" className="text-[10px]">
                          {t("library.publicDomain")}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
