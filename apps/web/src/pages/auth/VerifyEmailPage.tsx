import * as React from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-context";
import { ApiError } from "@/lib/api-client";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type VerifyState = { status: "loading" } | { status: "success" } | { status: "error"; message: string };

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  useDocumentTitle(t("auth.verifyEmail.title"));
  const [state, setState] = React.useState<VerifyState>({ status: "loading" });
  const consumed = React.useRef(false);

  React.useEffect(() => {
    if (consumed.current) return;
    consumed.current = true;
    const token = searchParams.get("token");
    (async () => {
      if (!token) {
        setState({ status: "error", message: t("auth.verifyEmail.missingToken") });
        return;
      }
      try {
        await authApi.verifyEmail(token);
        // Si une session existe (refresh cookie encore valide), on la
        // resynchronise pour que le profil soit immediatement a jour.
        try {
          await refreshSession();
        } catch {
          // Ignore : l'utilisateur peut se connecter normalement ensuite.
        }
        setState({ status: "success" });
      } catch (error) {
        const message = error instanceof ApiError ? error.message : t("common.error");
        setState({ status: "error", message });
      }
    })();
  }, [searchParams, t, refreshSession]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("auth.verifyEmail.title")}</CardTitle>
          <CardDescription>{t("auth.verifyEmail.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {state.status === "loading" && <p>{t("auth.verifyEmail.processing")}</p>}
          {state.status === "success" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <p className="text-sm text-muted-foreground">{t("auth.verifyEmail.success")}</p>
              <Button onClick={() => navigate("/profile")}>{t("auth.verifyEmail.goToProfile")}</Button>
            </div>
          )}
          {state.status === "error" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-destructive">{state.message}</p>
              <Button asChild variant="outline">
                <Link to="/login">{t("auth.verifyEmail.backToLogin")}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}