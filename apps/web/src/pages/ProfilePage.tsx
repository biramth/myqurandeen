import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";

export function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">{t("profile.loading")}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{user.displayName}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {t("profile.memberSince", { date: new Date(user.memberSince).toLocaleDateString(i18n.language) })}
          </p>
          <p className="text-sm text-muted-foreground">{t("profile.comingSoonNote")}</p>
          <Button variant="outline" onClick={() => logout()}>
            {t("profile.logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
