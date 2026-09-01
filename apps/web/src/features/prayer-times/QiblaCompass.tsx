import * as React from "react";
import { useTranslation } from "react-i18next";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QiblaCompassProps {
  /** Cap de la Qibla en degres depuis le nord vrai (0-360), calcule par computeQiblaDirection(). */
  qiblaDirection: number;
}

/**
 * Boussole vers la Qibla. Si l'appareil expose un capteur d'orientation
 * (mobile), la fleche pointe en direct vers la Kaaba en tenant compte de
 * l'orientation reelle du telephone ; sinon repli statique affichant
 * uniquement le cap depuis le nord (rose des vents non animee).
 *
 * iOS exige `DeviceOrientationEvent.requestPermission()` depuis un geste
 * utilisateur (bouton) - impossible a demander automatiquement au montage.
 */
export function QiblaCompass({ qiblaDirection }: QiblaCompassProps) {
  const { t } = useTranslation();
  const [heading, setHeading] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<"idle" | "active" | "unsupported" | "denied">("idle");

  const enableCompass = React.useCallback(async () => {
    const RequestableOrientationEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof RequestableOrientationEvent?.requestPermission === "function") {
      try {
        const result = await RequestableOrientationEvent.requestPermission();
        if (result !== "granted") {
          setStatus("denied");
          return;
        }
      } catch {
        setStatus("denied");
        return;
      }
    } else if (!("DeviceOrientationEvent" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus("active");
  }, []);

  React.useEffect(() => {
    if (status !== "active") return;
    function handleOrientation(event: DeviceOrientationEvent) {
      // iOS expose un cap boussole deja corrige (webkitCompassHeading) ;
      // ailleurs on approxime a partir de `alpha` (rotation autour de l'axe Z).
      const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === "number") {
        setHeading(webkitHeading);
      } else if (event.alpha != null) {
        setHeading(360 - event.alpha);
      }
    }
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [status]);

  const isLive = status === "active" && heading != null;
  const rotation = isLive ? qiblaDirection - (heading as number) : qiblaDirection;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-2 border-border bg-muted/30">
        <span className="absolute top-2 text-xs font-semibold text-muted-foreground">N</span>
        <span className="absolute bottom-2 text-xs text-muted-foreground">S</span>
        <span className="absolute left-2 text-xs text-muted-foreground">O</span>
        <span className="absolute right-2 text-xs text-muted-foreground">E</span>
        <div
          className="absolute inset-0 flex items-start justify-center pt-3 transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <Navigation className="h-9 w-9 fill-primary text-primary" aria-hidden="true" />
        </div>
        <div className="h-2 w-2 rounded-full bg-foreground" />
      </div>

      <p className="text-sm text-muted-foreground">{t("prayerTimes.qiblaDegrees", { degrees: Math.round(qiblaDirection) })}</p>

      {!isLive && (
        <div className="flex flex-col items-center gap-1">
          <Button type="button" size="sm" variant="outline" onClick={enableCompass}>
            {t("prayerTimes.enableCompass")}
          </Button>
          {status === "unsupported" && <p className="text-xs text-muted-foreground">{t("prayerTimes.compassUnsupported")}</p>}
          {status === "denied" && <p className="text-xs text-muted-foreground">{t("prayerTimes.compassDenied")}</p>}
          {status === "idle" && <p className="text-xs text-muted-foreground">{t("prayerTimes.compassStaticHint")}</p>}
        </div>
      )}
    </div>
  );
}
