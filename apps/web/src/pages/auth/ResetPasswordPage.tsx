import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";
import { authApi } from "@/features/auth/api";
import { ApiError } from "@/lib/api-client";
import { PageMeta } from "@/components/shared/PageMeta";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [done, setDone] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values: ResetPasswordValues) => {
    setServerError(null);
    if (!token) {
      setServerError(t("auth.resetPassword.missingToken"));
      return;
    }
    try {
      await authApi.resetPassword(token, values.password);
      setDone(true);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : t("common.error"));
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <PageMeta title={t("auth.resetPassword.title")} noindex />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("auth.resetPassword.title")}</CardTitle>
          <CardDescription>{t("auth.resetPassword.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <p className="text-sm text-muted-foreground">{t("auth.resetPassword.success")}</p>
              <Button onClick={() => navigate("/login")}>{t("auth.resetPassword.goToLogin")}</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.register.password")}</Label>
                <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.resetPassword.confirm")}</Label>
                <PasswordInput id="confirmPassword" autoComplete="new-password" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
                {isSubmitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}