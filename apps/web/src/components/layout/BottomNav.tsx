import * as React from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, BookOpen, Search, User, Menu, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_GROUPS } from "@/config/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { useAiEnabled } from "@/features/ai/useAiEnabled";

export function BottomNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const aiEnabled = useAiEnabled();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const items = [
    { label: t("nav.home"), href: "/", icon: Home },
    { label: t("nav.quran"), href: "/quran", icon: BookOpen },
    { label: t("nav.search"), href: "/search", icon: Search },
    { label: t("nav.profile"), href: "/profile", icon: User },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      aria-label={t("nav.bottomNavLabel")}
    >
      {items.map(({ label, href, icon: Icon }) => (
        <NavLink
          key={href}
          to={href}
          end={href === "/"}
          className={({ isActive }) =>
            cn(
              "flex min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] text-muted-foreground transition-colors active:bg-accent",
              isActive && "text-primary",
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                  isActive && "bg-primary/10",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] text-muted-foreground transition-colors active:bg-accent"
          >
            <span className="flex h-8 w-12 items-center justify-center rounded-full">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </span>
            {t("nav.menu")}
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-lg">
          <SheetHeader>
            <SheetTitle>{t("nav.menu")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-6 pb-4">
            {aiEnabled && (
              <div>
                <Link
                  to="/assistant"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{t("nav.assistant")}</span>
                </Link>
              </div>
            )}

            {NAV_GROUPS.map((group) => (
              <div key={group.titleKey}>
                <p className="mb-1.5 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t(group.titleKey)}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="truncate">{t(item.labelKey)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {user?.isStaff && (
              <div>
                <p className="mb-1.5 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("nav.groupAdmin")}
                </p>
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{t("nav.admin")}</span>
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
