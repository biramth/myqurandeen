import * as React from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Bell, BellOff, BellRing, Flame, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { notificationsApi, type TestResult } from "@/features/notifications/api";
import { usePushSubscription } from "@/features/notifications/usePushSubscription";
import { remindersApi } from "./api";
import { AddReminderDialog } from "./AddReminderDialog";
import { weekdayLabels } from "./weekdayLabels";

function PushToggle() {
  const { t } = useTranslation();
  const { support, permission, isStandalone, isSubscribed, subscribe, unsubscribe, isPending } =
    usePushSubscription();
  const [lastTest, setLastTest] = React.useState<TestResult | null>(null);

  /**
   * Sur iOS, `Notification.requestPermission()` / `subscribe()` restent
   * totalement silencieux tant que l'app n'est pas ouverte en mode installe
   * (icone du home screen) : d'ou l'impression que le bouton "ne marche pas".
   */
  const isIos = React.useMemo(() => {
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }, []);

  const testMutation = useMutation({
    mutationFn: () => notificationsApi.test(),
    onSuccess: ({ sent, total, devices }) => {
      setLastTest({ sent, total, devices });
      if (sent > 0) {
        toast.success(t("reminders.testPushSuccess"));
      } else {
        toast.error(t("reminders.testPushError"));
      }
    },
    onError: () => toast.error(t("reminders.testPushError")),
  });

  if (support === "unsupported") {
    return <p className="text-sm text-muted-foreground">{t("reminders.pushUnsupported")}</p>;
  }
  if (support === "unconfigured") {
    return <p className="text-sm text-muted-foreground">{t("reminders.pushUnconfigured")}</p>;
  }
  if (isIos && !isStandalone) {
    return (
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <BellOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t("reminders.pushNeedInstall")}
        </p>
        <p className="text-xs text-muted-foreground">{t("reminders.pushNeedInstallHint")}</p>
      </div>
    );
  }
  if (permission === "denied") {
    return (
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <BellOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t("reminders.pushDenied")}
        </p>
        {isIos && <p className="text-xs text-muted-foreground">{t("reminders.pushReinstall")}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-sm">
        {isSubscribed ? (
          <BellRing className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Bell className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        {isSubscribed ? t("reminders.pushEnabled") : t("reminders.pushPrompt")}
      </p>
<div className="flex items-center gap-2">
          {isSubscribed && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={testMutation.isPending}
              onClick={() => testMutation.mutate()}
            >
              {testMutation.isPending ? (
                t("reminders.testPushSending")
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {t("reminders.testPush")}
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant={isSubscribed ? "outline" : "default"}
            disabled={isPending}
            onClick={() =>
              (isSubscribed ? unsubscribe() : subscribe()).catch(() => toast.error(t("reminders.error")))
            }
          >
            {isSubscribed ? t("reminders.disablePush") : t("reminders.enablePush")}
          </Button>
        </div>
      {lastTest && lastTest.devices.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {lastTest.devices.map((device, i) => (
            <li key={i}>
              {device.userAgent ? `${device.userAgent} · ` : ""}
              {device.host} {device.result === "gone" ? ` · ${t("reminders.testPushGone")}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RotationSettingsCard() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["reminders", "rotation-settings"],
    queryFn: remindersApi.getRotationSettings,
  });

  const [timeOfDay, setTimeOfDay] = React.useState("06:00");
  const [days, setDays] = React.useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  React.useEffect(() => {
    if (settings) {
      setTimeOfDay(settings.timeOfDay);
      setDays(settings.daysOfWeek);
    }
  }, [settings]);

  const upsertMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      remindersApi.upsertRotationSettings({
        timeOfDay,
        daysOfWeek: days,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", "rotation-settings"] });
      toast.success(t("reminders.updated"));
    },
    onError: () => toast.error(t("reminders.error")),
  });

  const toggleDay = (day: number) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  };

  const labels = weekdayLabels(i18n.language);

  if (isLoading) return <Skeleton className="h-24 w-full" />;

  const isActive = settings?.isActive ?? false;

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{t("reminders.rotationTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("reminders.rotationDescription")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={isActive ? "outline" : "default"}
          disabled={upsertMutation.isPending || days.length === 0}
          onClick={() => upsertMutation.mutate(!isActive)}
        >
          {isActive ? t("reminders.rotationDisable") : t("reminders.rotationEnable")}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Input
          type="time"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          className="h-9 w-28"
        />
        <div className="flex gap-1.5">
          {labels.map((label, day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={days.includes(day)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors",
                days.includes(day)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input text-muted-foreground hover:bg-accent",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {isActive && settings && (timeOfDay !== settings.timeOfDay || days.join() !== settings.daysOfWeek.join()) && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-3"
          disabled={upsertMutation.isPending || days.length === 0}
          onClick={() => upsertMutation.mutate(true)}
        >
          {t("reminders.save")}
        </Button>
      )}
    </div>
  );
}

function StreakAlertCard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["reminders", "streak-alert-settings"],
    queryFn: remindersApi.getStreakAlertSettings,
  });

  const [timeOfDay, setTimeOfDay] = React.useState("19:00");

  React.useEffect(() => {
    if (settings) setTimeOfDay(settings.timeOfDay);
  }, [settings]);

  const upsertMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      remindersApi.upsertStreakAlertSettings({
        timeOfDay,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", "streak-alert-settings"] });
      toast.success(t("reminders.updated"));
    },
    onError: () => toast.error(t("reminders.error")),
  });

  if (isLoading) return <Skeleton className="h-24 w-full" />;

  const isActive = settings?.isActive ?? false;

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Flame className="h-4 w-4 text-orange-400" aria-hidden="true" />
            {t("reminders.streakAlertTitle")}
          </p>
          <p className="text-xs text-muted-foreground">{t("reminders.streakAlertDescription")}</p>
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
            className="h-9 w-28"
          />
          {settings && timeOfDay !== settings.timeOfDay && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={upsertMutation.isPending}
              onClick={() => upsertMutation.mutate(true)}
            >
              {t("reminders.save")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function RemindersTab() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { data: reminders, isLoading } = useQuery({ queryKey: ["reminders"], queryFn: remindersApi.list });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remindersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success(t("reminders.deleted"));
    },
    onError: () => toast.error(t("reminders.error")),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => remindersApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
    onError: () => toast.error(t("reminders.error")),
  });

  const labels = weekdayLabels(i18n.language);

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-3">
        <PushToggle />
      </div>

      <RotationSettingsCard />

      <StreakAlertCard />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("reminders.yourReminders")}</h3>
          <AddReminderDialog />
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {!isLoading && (!reminders || reminders.length === 0) && (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("reminders.empty")}</p>
        )}

        <div className="space-y-2">
          {reminders?.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between gap-2 rounded-md border p-3 transition-colors hover:border-primary/30"
            >
              <div className="min-w-0">
                <Link to={reminder.href} className="truncate text-sm font-medium hover:underline">
                  {reminder.label}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {reminder.timeOfDay} ·{" "}
                  {reminder.daysOfWeek.length === 7
                    ? t("reminders.everyDay")
                    : reminder.daysOfWeek.map((d) => labels[d]).join(" ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={toggleActiveMutation.isPending}
                  onClick={() => toggleActiveMutation.mutate({ id: reminder.id, isActive: !reminder.isActive })}
                >
                  {reminder.isActive ? t("reminders.active") : t("reminders.paused")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(reminder.id)}
                  aria-label={t("reminders.delete")}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
