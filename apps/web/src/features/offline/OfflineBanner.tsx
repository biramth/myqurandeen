import { useTranslation } from "react-i18next";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/features/offline/useOnlineStatus";

export function OfflineBanner() {
  const { t } = useTranslation();
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{t("offline.banner")}</span>
    </div>
  );
}
