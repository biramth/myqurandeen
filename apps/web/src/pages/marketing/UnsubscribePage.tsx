import * as React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { marketingApi } from "@/features/marketing/api";
import { ApiError } from "@/lib/api-client";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type UnsubscribeState = { status: "loading" } | { status: "success" } | { status: "error"; message: string };

export function UnsubscribePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  useDocumentTitle(t("marketing.unsubscribe.title"));
  const [state, setState] = React.useState<UnsubscribeState>({ status: "loading" });
  const requested = React.useRef(false);

  React.useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    const token = searchParams.get("token");
    if (!token) {
      setState({ status: "error", message: t("marketing.unsubscribe.missingToken") });
      return;
    }
    (async () => {
      try {
        await marketingApi.unsubscribe(token);
        setState({ status: "success" });
      } catch (error) {
        const message = error instanceof ApiError ? error.message : t("marketing.unsubscribe.error");
        setState({ status: "error", message });
      }
    })();
  }, [searchParams, t]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("marketing.unsubscribe.title")}</CardTitle>
          <CardDescription>{t("marketing.unsubscribe.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {state.status === "loading" && <p>{t("marketing.unsubscribe.processing")}</p>}
          {state.status === "success" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <p className="text-sm text-muted-foreground">{t("marketing.unsubscribe.success")}</p>
              <Button asChild variant="outline">
                <Link to="/">{t("marketing.unsubscribe.backToHome")}</Link>
              </Button>
            </div>
          )}
          {state.status === "error" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-destructive">{state.message}</p>
              <Button asChild variant="outline">
                <Link to="/">{t("marketing.unsubscribe.backToHome")}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
