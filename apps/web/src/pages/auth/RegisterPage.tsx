import * as React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";
import { GoogleButton } from "@/features/auth/GoogleButton";
import { ApiError } from "@/lib/api-client";
import { authApi } from "@/features/auth/api";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { MailCheck } from "lucide-react";

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  useDocumentTitle(t("auth.register.title"));
  const [registeredEmail, setRegisteredEmail] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = React.useState(false);

  // Uniquement un chemin interne (commencant par un seul "/") pour eviter
  // qu'un lien construit avec ?redirect=https://... ne soit reutilise.
  const redirectParam = searchParams.get("redirect");
  const loginHref = redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login";

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
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    try {
      await registerUser(values);
      // Le compte est cree mais l'email n'est pas encore verifie : on reste sur
      // cette page pour inviter a verifier son email plutot que de naviguer.
      setRegisteredEmail(values.email);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : t("common.error"));
    }
  };

  if (registeredEmail) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 pt-8 text-center">
            <MailCheck className="h-12 w-12 text-primary" />
            <p className="text-sm text-muted-foreground">{t("auth.register.checkEmail", { email: registeredEmail })}</p>
            <Button asChild>
              <Link to="/profile">{t("auth.verifyEmail.goToProfile")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("auth.register.title")}</CardTitle>
          <CardDescription>{t("auth.register.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
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
              <Label htmlFor="displayName">{t("auth.register.displayName")}</Label>
              <Input id="displayName" autoComplete="name" {...register("displayName")} />
              {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.register.email")}</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.register.password")}</Label>
              <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.register.haveAccount")}{" "}
            <Link to={loginHref} className="text-primary underline-offset-4 hover:underline">
              {t("auth.register.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
