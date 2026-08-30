import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useAuth } from "@/features/auth/auth-context";
import { StreakBadge } from "@/features/streaks/StreakBadge";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
          myQurandeen
        </Link>

        <div className="flex items-center gap-1">
          {user && <StreakBadge />}
          <LanguageSwitcher />
          <ThemeToggle />
          {!isLoading && (
            <Button variant={user ? "outline" : "default"} size="sm" asChild>
              <Link to={user ? "/profile" : "/login"} aria-label={user ? user.displayName : t("nav.login")}>
                <User className="h-4 w-4" />
                <span className={cn("max-w-[10rem] truncate", user && "hidden sm:inline")}>
                  {user ? user.displayName : t("nav.login")}
                </span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
