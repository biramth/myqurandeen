import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas";
import { authApi } from "@/features/auth/api";
import { ApiError } from "@/lib/api-client";
import { PageMeta } from "@/components/shared/PageMeta";
import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setServerError(null);
    try {
      // Reponse generique cote API : on affiche toujours la confirmation pour
      // ne pas reveler si l'email existe.
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : t("common.error"));
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <PageMeta title={t("auth.forgotPassword.title")} noindex />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("auth.forgotPassword.title")}</CardTitle>
          <CardDescription>{t("auth.forgotPassword.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <MailCheck className="h-12 w-12 text-primary" />
              <p className="text-sm text-muted-foreground">{t("auth.forgotPassword.checkEmail")}</p>
              <Button asChild variant="outline">
                <Link to="/login">{t("auth.forgotPassword.backToLogin")}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.login.email")}</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}