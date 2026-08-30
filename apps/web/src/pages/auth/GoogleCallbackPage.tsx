import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/features/auth/auth-context";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

/**
 * Page de retour du flux Google OAuth : l'API a pose le cookie refresh httpOnly
 * puis a redirige ici. On passe par refreshSession() du contexte (et non des
 * appels authApi directs) pour que le AuthProvider connaisse le nouvel
 * utilisateur connecte - sinon ProfilePage, qui redirige vers /login des que
 * `user` est null dans le contexte, nous renverrait aussitot en arriere.
 */
export function GoogleCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  useDocumentTitle(t("auth.oauth.title"));
  const [error, setError] = React.useState(false);
  const done = React.useRef(false);

  React.useEffect(() => {
    if (done.current) return;
    done.current = true;
    (async () => {
      try {
        await refreshSession();
        navigate("/profile", { replace: true });
      } catch (err) {
        if (!(err instanceof ApiError)) console.error(err);
        setError(true);
      }
    })();
  }, [navigate, refreshSession]);

  if (error) {
    return <div className="px-4 py-16 text-center text-sm text-muted-foreground">{t("auth.oauth.error")}</div>;
  }
  return <div className="px-4 py-16 text-center text-sm text-muted-foreground">{t("auth.oauth.connecting")}</div>;
}