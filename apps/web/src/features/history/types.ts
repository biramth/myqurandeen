export interface HistoricalPeriod {
  id: string;
  name: string;
  slug: string;
  startYear: number | null;
  endYear: number | null;
  region: string | null;
  description: string | null;
}

export interface HistoricalEventSummary {
  id: string;
  title: string;
  slug: string;
  dateApprox: string | null;
  eventType: string | null;
  description: string;
}

export interface HistoricalPeriodDetail extends HistoricalPeriod {
  events: HistoricalEventSummary[];
}

export interface HistoricalEventDetail {
  event: {
    id: string;
    title: string;
    slug: string;
    dateApprox: string | null;
    eventType: string | null;
    description: string;
  };
  period: { slug: string; name: string } | null;
  sources: { title: string; url: string | null }[];
}
