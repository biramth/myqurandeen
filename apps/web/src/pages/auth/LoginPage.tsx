import * as React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { ApiError } from "@/lib/api-client";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  useDocumentTitle(t("auth.login.title"));
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Uniquement un chemin interne (commencant par un seul "/") pour eviter
  // qu'un lien construit avec ?redirect=https://... ne soit reutilise.
  const redirectParam = searchParams.get("redirect");
  const redirect = redirectParam && /^\/(?!\/)/.test(redirectParam) ? redirectParam : "/profile";
  const registerHref = redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      await login(values);
      navigate(redirect);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : t("common.error"));
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.login.email")}</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.login.password")}</Label>
              <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
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
