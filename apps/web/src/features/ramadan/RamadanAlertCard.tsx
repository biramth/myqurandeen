import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { remindersApi } from "@/features/reminders/api";

/** Notification quotidienne pendant le Ramadan - meme composant que StreakAlertCard (RemindersTab.tsx), reglages distincts. */
export function RamadanAlertCard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["reminders", "ramadan-alert-settings"],
    queryFn: remindersApi.getRamadanAlertSettings,
  });

  const [timeOfDay, setTimeOfDay] = React.useState("09:00");

  React.useEffect(() => {
    if (settings) setTimeOfDay(settings.timeOfDay);
  }, [settings]);

  const upsertMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      remindersApi.upsertRamadanAlertSettings({
        timeOfDay,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", "ramadan-alert-settings"] });
      toast.success(t("reminders.updated"));
    },
    onError: () => toast.error(t("reminders.error")),
  });

  if (isLoading) return null;

  const isActive = settings?.isActive ?? false;

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("ramadan.alertTitle")}
          </p>
          <p className="text-xs text-muted-foreground">{t("ramadan.alertDescription")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={isActive ? "outline" : "default"}
          disabled={upsertMutation.isPending}
          onClick={() => upsertMutation.mutate(!isActive)}
        >
          {isActive ? t("reminders.streakAlertDisable") : t("reminders.streakAlertEnable")}
        </Button>
      </div>

      {isActive && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Input
            type="time"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="w-32"
          />
          <Button type="button" size="sm" variant="secondary" disabled={upsertMutation.isPending} onClick={() => upsertMutation.mutate(true)}>
            {t("reminders.save")}
          </Button>
        </div>
      )}
    </div>
  );
}
