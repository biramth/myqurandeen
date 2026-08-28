import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/config/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { useAiEnabled } from "@/features/ai/useAiEnabled";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
    isActive && "bg-accent font-medium text-foreground",
  );

export function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const aiEnabled = useAiEnabled();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto border-e px-3 py-6 md:block">
      <nav aria-label={t("nav.sidebarLabel")} className="space-y-6">
        {aiEnabled && (
          <div>
            <NavLink to="/assistant" className={navLinkClass}>
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{t("nav.assistant")}</span>
            </NavLink>
          </div>
        )}

        {NAV_GROUPS.map((group) => (
          <div key={group.titleKey}>
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t(group.titleKey)}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} to={item.href} className={navLinkClass}>
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{t(item.labelKey)}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {user?.isStaff && (
          <div>
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("nav.groupAdmin")}
            </p>
            <NavLink to="/admin" className={navLinkClass}>
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{t("nav.admin")}</span>
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
}
