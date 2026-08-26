import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useAuth } from "@/features/auth/auth-context";

export function Header() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
          Qurandeen
        </Link>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          {!isLoading && (
            <Button variant={user ? "outline" : "default"} size="sm" asChild>
              <Link to={user ? "/profile" : "/login"}>
                <User className="h-4 w-4" />
                {user ? user.displayName : t("nav.login")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
