import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useAuth } from "@/features/auth/auth-context";
import { StreakBadge } from "@/features/streaks/StreakBadge";
import { LevelBadge } from "@/features/gamification/LevelBadge";

/**
 * Header en deux versions :
 * - mobile (md:hidden) : logo + strek + langue + theme, sans le bouton
 *   profil (deja present dans la BottomNav - eviter la redondance).
 * - bureau (md:+) : logo + streaks/niveau + langue + theme + profil
 *   (la BottomNav etant masquee a partir de md, le profil doit rester ici).
 */
export function Header() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">myQurandeen</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          {user && (
            <>
              <StreakBadge />
              <span className="hidden md:inline-flex">
                <LevelBadge />
              </span>
            </>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          {!isLoading && (
            <Button
              variant={user ? "outline" : "default"}
              size="sm"
              className="hidden md:inline-flex"
              asChild
            >
              <Link to={user ? "/profile" : "/login"} aria-label={user ? user.displayName : t("nav.login")}>
                <User className="h-4 w-4" aria-hidden="true" />
                <span className="max-w-[10rem] truncate">{user ? user.displayName : t("nav.login")}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}