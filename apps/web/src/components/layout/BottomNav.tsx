import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, BookOpen, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { t } = useTranslation();

  const items = [
    { label: t("nav.home"), href: "/", icon: Home },
    { label: t("nav.quran"), href: "/quran", icon: BookOpen },
    { label: t("nav.search"), href: "/search", icon: Search },
    { label: t("nav.profile"), href: "/profile", icon: User },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t bg-background md:hidden"
      aria-label="Navigation principale"
    >
      {items.map(({ label, href, icon: Icon }) => (
        <NavLink
          key={href}
          to={href}
          className={({ isActive }) =>
            cn(
              "flex min-w-[64px] flex-col items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground",
              isActive && "text-primary",
            )
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
