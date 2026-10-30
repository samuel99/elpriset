import { API_CONFIG, buildPriceUrl } from "@/config/api";
import type { ForecastPriceEntry, PriceArea, PriceEntry } from "@/types";
import { addMarketDays, getMarketDateKey, QUARTER_HOUR_MS } from "@/utils/dateUtils";
import { fetchJson } from "./apiClient";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isTimestamp = (value: unknown): value is string =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPriceEntry = (value: unknown): value is PriceEntry =>
  isRecord(value) &&
  isFiniteNumber(value.SEK_per_kWh) &&
  isFiniteNumber(value.EUR_per_kWh) &&
  isFiniteNumber(value.EXR) &&
  isTimestamp(value.time_start) &&
  isTimestamp(value.time_end) &&
  Date.parse(value.time_end) > Date.parse(value.time_start);

export async function fetchForecastPrices(
  area: PriceArea,
  signal?: AbortSignal,
): Promise<ForecastPriceEntry[]> {
  const url = new URL(API_CONFIG.FORECAST_URL);
  url.searchParams.set("zone", area);
  const data = await fetchJson(url.toString(), signal);
  if (!isRecord(data) || data.zone !== area || !Array.isArray(data.days)) {
    throw new Error("Invalid forecast response");
  }

  return data.days.flatMap((day: unknown) => {
    if (!isRecord(day) || !Array.isArray(day.points)) {
      throw new Error("Invalid forecast points");
    }
    return day.points.map((point: unknown) => {
      if (!isRecord(point) || !isTimestamp(point.ts_utc) || !isFiniteNumber(point.ore_kwh)) {
        throw new Error("Invalid forecast point");
      }
      const start = Date.parse(point.ts_utc);
      return {
        SEK_per_kWh: point.ore_kwh / 100,
        time_start: new Date(start).toISOString(),
        time_end: new Date(start + QUARTER_HOUR_MS).toISOString(),
        isForecast: true as const,
      };
    });
  });
}

/**
 * Fetch electricity prices for a specific area and date
 */
export async function fetchPricesForDate(
  area: PriceArea,
  daysOffset: number = 0,
  signal?: AbortSignal,
  now: Date = new Date(),
): Promise<PriceEntry[]> {
  const dateKey = addMarketDays(getMarketDateKey(now), daysOffset);
  const data = await fetchJson(buildPriceUrl(area, dateKey), signal);
  if (!Array.isArray(data) || !data.every(isPriceEntry)) {
    throw new Error("Invalid published price response");
  }
  return data;
}
