import * as React from "react";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface PlaceResult {
  name: string;
  detail: string;
  latitude: number;
  longitude: number;
}

/**
 * Recherche de lieux via Photon (Komoot - geocoder open-source base sur
 * OpenStreetMap) : gratuit, sans cle API, CORS active, multilingue.
 * Le resultat renvoie [lng, lat] dans geometry.coordinates.
 */
interface PhotonProperties {
  name?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
  countrycode?: string;
}

interface PhotonFeature {
  properties: PhotonProperties;
  geometry?: { coordinates?: [number, number] };
}

function toPlaceResult(feature: PhotonFeature): PlaceResult | null {
  const { properties } = feature;
  const coords = feature.geometry?.coordinates;
  if (!coords) return null;
  const name = properties.name ?? properties.city ?? properties.town ?? properties.village;
  const detail = [properties.state, properties.country].filter(Boolean).join(", ");
  if (!name || !detail) return null;
  return { name, detail, latitude: coords[1], longitude: coords[0] };
}

async function searchPlaces(query: string, locale: string, signal: AbortSignal): Promise<PlaceResult[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "7");
  url.searchParams.set("lang", locale);
  const response = await fetch(url.toString(), { signal });
  if (!response.ok) throw new Error(`Geocodage HTTP ${response.status}`);
  const json = (await response.json()) as { features?: PhotonFeature[] };
  return (json.features ?? []).map(toPlaceResult).filter((place): place is PlaceResult => place !== null);
}

interface CitySearchInputProps {
  locale: string;
  onSelect: (place: PlaceResult) => void;
}

/** Recherche de ville/pays avec debounce + annulation des requetes en vol. */
export function CitySearchInput({ locale, onSelect }: CitySearchInputProps) {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<PlaceResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      setError(false);
      setSearched(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSearching(true);
      setError(false);
      searchPlaces(query.trim(), locale, controller.signal)
        .then((places) => {
          setResults(places);
          setSearched(true);
          setSearching(false);
        })
        .catch((err: unknown) => {
          if (Object(err).name === "AbortError") return;
          setSearching(false);
          setError(true);
        });
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, locale]);

  return (
    <div className="space-y-2">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("prayerTimes.manualCityPlaceholder")}
        aria-label={t("prayerTimes.manualCityPlaceholder")}
      />
      {searching && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          {t("prayerTimes.manualSearching")}
        </div>
      )}
      {!searching && error && <p className="text-xs text-destructive">{t("prayerTimes.manualSearchError")}</p>}
      {!searching && !error && searched && results.length === 0 && (
        <p className="text-xs text-muted-foreground">{t("prayerTimes.manualNoResults")}</p>
      )}
      {!searching && !error && results.length > 0 && (
        <ul className="max-h-56 divide-y overflow-y-auto rounded-md border">
          {results.map((place) => (
            <li key={`${place.name}-${place.latitude}-${place.longitude}`}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => onSelect(place)}
              >
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{place.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{place.detail}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}