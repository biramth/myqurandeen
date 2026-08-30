import * as React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { GoogleButton } from "@/features/auth/GoogleButton";
import { ApiError } from "@/lib/api-client";
import { authApi } from "@/features/auth/api";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  useDocumentTitle(t("auth.login.title"));
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [emailForResend, setEmailForResend] = React.useState<string | null>(null);
  const [resendSent, setResendSent] = React.useState(false);
  const [googleEnabled, setGoogleEnabled] = React.useState(false);
  const googleError = searchParams.get("google") === "error";

  // Uniquement un chemin interne (commencant par un seul "/") pour eviter
  // qu'un lien construit avec ?redirect=https://... ne soit reutilise.
  const redirectParam = searchParams.get("redirect");
  const redirect = redirectParam && /^\/(?!\/)/.test(redirectParam) ? redirectParam : "/profile";
  const registerHref = redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register";

  React.useEffect(() => {
    authApi
      .googleConfig()
      .then((cfg) => setGoogleEnabled(cfg.enabled))
      .catch(() => setGoogleEnabled(false));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    setEmailForResend(null);
    setResendSent(false);
    try {
      await login(values);
      navigate(redirect);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403 && error.message === "EMAIL_NOT_VERIFIED") {
        setEmailForResend(values.email);
        setServerError(t("auth.login.emailNotVerified"));
        return;
      }
      setServerError(error instanceof ApiError ? error.message : t("common.error"));
    }
  };

  const handleResend = async () => {
    if (!emailForResend) return;
    try {
      await authApi.resendVerification(emailForResend);
      setResendSent(true);
    } catch {
      setServerError(t("common.error"));
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {googleError && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {t("auth.oauth.error")}
            </div>
          )}
          {googleEnabled && (
            <>
              <GoogleButton />
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t("auth.or")}</span>
                </div>
              </div>
            </>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.login.email")}</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.login.password")}</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>
              <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            {emailForResend && !resendSent && (
              <button
                type="button"
                onClick={handleResend}
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                {t("auth.login.resendVerification")}
              </button>
            )}
            {resendSent && <p className="text-xs text-muted-foreground">{t("auth.login.resendSent")}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.login.noAccount")}{" "}
            <Link to={registerHref} className="text-primary underline-offset-4 hover:underline">
              {t("auth.login.createAccount")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}