import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useAuth } from "@/features/auth/auth-context";

export function Header() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  const navLinks = [
    { label: t("nav.quran"), href: "/quran" },
    { label: t("nav.hadith"), href: "/hadith" },
    { label: t("nav.fiqh"), href: "/schools" },
    { label: t("nav.history"), href: "/history" },
    { label: t("nav.library"), href: "/library" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
          Qurandeen
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

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
