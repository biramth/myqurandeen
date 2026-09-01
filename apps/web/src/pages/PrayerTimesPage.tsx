import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock3, Compass as CompassIcon, MapPin, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PageMeta, SITE_URL } from "@/components/shared/PageMeta";
import { SignUpPromptPopover } from "@/components/shared/SignUpPromptPopover";
import { useAuth } from "@/features/auth/auth-context";
import { useGeolocation } from "@/features/prayer-times/useGeolocation";
import { CitySearchInput } from "@/features/prayer-times/CitySearchInput";
import { prayerAlertApi } from "@/features/prayer-times/api";
import { QiblaCompass } from "@/features/prayer-times/QiblaCompass";
import {
  computePrayerTimes,
  computeQiblaDirection,
  DEFAULT_PRAYER_CALCULATION_METHOD,
  nextPrayer,
  PRAYER_CALCULATION_METHODS,
  PRAYER_NAMES,
  type PrayerCalculationMethod,
  type PrayerName,
} from "@/features/prayer-times/prayer-times";

const METHOD_STORAGE_KEY = "qurandeen:prayer-method";

function loadStoredMethod(): PrayerCalculationMethod {
  try {
    const raw = localStorage.getItem(METHOD_STORAGE_KEY);
    if (raw && (PRAYER_CALCULATION_METHODS as readonly string[]).includes(raw)) return raw as PrayerCalculationMethod;
  } catch {
    // Stockage indisponible - repli sur la methode par defaut.
  }
  return DEFAULT_PRAYER_CALCULATION_METHOD;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatCountdown(target: Date, now: Date): string {
  const totalMinutes = Math.max(0, Math.round((target.getTime() - now.getTime()) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes.toString().padStart(2, "0")}`;
}

export function PrayerTimesPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { coords, status: locationStatus, request: requestLocation, setManualCoords, isStandalone, isIOSStandalone } =
    useGeolocation();
  const [method, setMethod] = React.useState<PrayerCalculationMethod>(() => loadStoredMethod());
  const [now, setNow] = React.useState(() => new Date());
  const [manualOpen, setManualOpen] = React.useState(false);

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const handleMethodChange = (value: PrayerCalculationMethod) => {
    setMethod(value);
    try {
      localStorage.setItem(METHOD_STORAGE_KEY, value);
    } catch {
      // Stockage indisponible - le choix reste actif pour cette session.
    }
  };

  const times = coords ? computePrayerTimes(coords.latitude, coords.longitude, now, method) : null;
  const upcoming = coords ? nextPrayer(coords.latitude, coords.longitude, method, now) : null;
  const qiblaDirection = coords ? computeQiblaDirection(coords.latitude, coords.longitude) : null;

  const prayerRows: { name: PrayerName | "sunrise"; time: Date }[] = times
    ? [
        { name: "fajr", time: times.fajr },
        { name: "sunrise", time: times.sunrise },
        { name: "dhuhr", time: times.dhuhr },
        { name: "asr", time: times.asr },
        { name: "maghrib", time: times.maghrib },
        { name: "isha", time: times.isha },
      ]
    : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageMeta
        title={t("prayerTimes.title")}
        description={t("prayerTimes.subtitle")}
        url={`${SITE_URL}/prayer-times`}
      />

      <div className="mb-8 flex items-center gap-3">
        <Clock3 className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("prayerTimes.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("prayerTimes.subtitle")}</p>
        </div>
      </div>

      {!coords && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <MapPin className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            {isIOSStandalone ? (
              locationStatus === "denied" || locationStatus === "unavailable" || locationStatus === "timeout" || locationStatus === "unsupported" ? (
                <>
                  <p className="text-sm font-medium">{t("prayerTimes.locationIosHeading")}</p>
                  <div className="space-y-1.5 rounded-md border bg-muted/40 p-4 text-left text-xs text-muted-foreground">
                    <p>{t("prayerTimes.locationIosStep1")}</p>
                    <p>{t("prayerTimes.locationIosStep2")}</p>
                    <p>{t("prayerTimes.locationIosStep3")}</p>
                    <p>{t("prayerTimes.locationIosStep4")}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t("prayerTimes.locationTapToEnable")}</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                {isStandalone ? t("prayerTimes.locationPromptStandalone") : t("prayerTimes.locationPrompt")}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button type="button" onClick={requestLocation} disabled={locationStatus === "loading"}>
                {locationStatus === "loading" ? t("prayerTimes.locationLoading") : t("prayerTimes.enableLocation")}
              </Button>
              {(locationStatus === "denied" || locationStatus === "unavailable" || locationStatus === "timeout" || locationStatus === "unsupported") && (
                <Button type="button" variant="outline" size="sm" onClick={requestLocation}>
                  {t("prayerTimes.locationRetry")}
                </Button>
              )}
            </div>
            {locationStatus === "denied" && <p className="text-xs text-destructive">{t("prayerTimes.locationDenied")}</p>}
            {locationStatus === "unavailable" && <p className="text-xs text-destructive">{t("prayerTimes.locationUnavailable")}</p>}
            {locationStatus === "timeout" && <p className="text-xs text-destructive">{t("prayerTimes.locationTimeout")}</p>}
            {locationStatus === "unsupported" && <p className="text-xs text-destructive">{t("prayerTimes.locationUnsupported")}</p>}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-muted-foreground underline"
              onClick={() => setManualOpen((open) => !open)}
            >
              {t("prayerTimes.manualTitle")}
            </Button>

            {manualOpen && (
              <div className="mt-2 w-full max-w-sm space-y-3 rounded-md border p-4 text-left">
                <p className="text-xs text-muted-foreground">{t("prayerTimes.manualDescription")}</p>
                <CitySearchInput
                  locale={i18n.language}
                  onSelect={(place) => {
                    setManualCoords({ latitude: place.latitude, longitude: place.longitude });
                    setManualOpen(false);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {coords && times && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={requestLocation} disabled={locationStatus === "loading"}>
              <MapPin className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {t("prayerTimes.refreshLocation")}
            </Button>
            <Select value={method} onValueChange={(value) => handleMethodChange(value as PrayerCalculationMethod)}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRAYER_CALCULATION_METHODS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`prayerTimes.methods.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {upcoming && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("prayerTimes.nextPrayer")}</p>
                  <p className="text-lg font-semibold">{t(`prayerTimes.prayers.${upcoming.name}`)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold tabular-nums">{formatTime(upcoming.time)}</p>
                  <p className="text-xs text-muted-foreground">{t("prayerTimes.inTime", { time: formatCountdown(upcoming.time, now) })}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="divide-y rounded-md border">
            {prayerRows.map((row) => {
              const isNext = upcoming && row.name === upcoming.name && row.time.getTime() === upcoming.time.getTime();
              const isSunrise = row.name === "sunrise";
              return (
                <div
                  key={row.name}
                  className={cn(
                    "flex items-center justify-between px-4 py-3",
                    isNext && "bg-primary/5",
                    isSunrise && "text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isSunrise && <Sunrise className="h-4 w-4" aria-hidden="true" />}
                    <span className={cn("text-sm", !isSunrise && "font-medium")}>{t(`prayerTimes.prayers.${row.name}`)}</span>
                  </div>
                  <span className="tabular-nums text-sm">{formatTime(row.time)}</span>
                </div>
              );
            })}
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <CompassIcon className="h-4 w-4" aria-hidden="true" />
              {t("prayerTimes.qiblaTitle")}
            </h2>
            <Card>
              <CardContent className="flex justify-center p-6">
                {qiblaDirection != null && <QiblaCompass qiblaDirection={qiblaDirection} />}
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">{t("prayerTimes.notificationsTitle")}</h2>
            <PrayerAlertCard coords={coords} timezone={Intl.DateTimeFormat().resolvedOptions().timeZone} method={method} isLoggedIn={Boolean(user)} />
          </div>
        </div>
      )}
    </div>
  );
}

interface PrayerAlertCardProps {
  coords: { latitude: number; longitude: number };
  timezone: string;
  method: PrayerCalculationMethod;
  isLoggedIn: boolean;
}

function PrayerAlertCard({ coords, timezone, method, isLoggedIn }: PrayerAlertCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["prayer-times", "alert-settings"],
    queryFn: prayerAlertApi.getSettings,
    enabled: isLoggedIn,
  });

  const [enabledPrayers, setEnabledPrayers] = React.useState<PrayerName[]>([...PRAYER_NAMES]);

  React.useEffect(() => {
    if (settings) setEnabledPrayers(settings.enabledPrayers);
  }, [settings]);

  const upsertMutation = useMutation({
    mutationFn: (input: { isActive: boolean; enabledPrayers: PrayerName[] }) =>
      prayerAlertApi.upsertSettings({
        latitude: coords.latitude,
        longitude: coords.longitude,
        timezone,
        calculationMethod: method,
        enabledPrayers: input.enabledPrayers,
        isActive: input.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-times", "alert-settings"] });
      toast.success(t("reminders.updated"));
    },
    onError: () => toast.error(t("reminders.error")),
  });

  if (!isLoggedIn) {
    return (
      <Card>
        <CardContent className="p-4">
          <SignUpPromptPopover
            trigger={<Button type="button">{t("prayerTimes.enableNotifications")}</Button>}
            description={t("authPrompt.prayerAlertDescription")}
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <Skeleton className="h-24 w-full" />;

  const isActive = settings?.isActive ?? false;

  function togglePrayer(prayer: PrayerName) {
    const next = enabledPrayers.includes(prayer)
      ? enabledPrayers.filter((p) => p !== prayer)
      : [...enabledPrayers, prayer];
    if (next.length === 0) return; // au moins une priere selectionnee
    setEnabledPrayers(next);
    if (isActive) upsertMutation.mutate({ isActive: true, enabledPrayers: next });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{t("prayerTimes.notificationsDescription")}</p>
          <Button
            type="button"
            size="sm"
            variant={isActive ? "outline" : "default"}
            disabled={upsertMutation.isPending}
            onClick={() => upsertMutation.mutate({ isActive: !isActive, enabledPrayers })}
          >
            {isActive ? t("prayerTimes.disableNotifications") : t("prayerTimes.enableNotifications")}
          </Button>
        </div>

        {isActive && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PRAYER_NAMES.map((prayer) => (
              <button
                key={prayer}
                type="button"
                onClick={() => togglePrayer(prayer)}
                aria-pressed={enabledPrayers.includes(prayer)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  enabledPrayers.includes(prayer)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input text-muted-foreground hover:bg-accent",
                )}
              >
                {t(`prayerTimes.prayers.${prayer}`)}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
