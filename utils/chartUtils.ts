import { Colors } from "@/constants/Colors";
import type { BarDataPoint, ChartPriceEntry, ForecastPriceEntry, PriceEntry } from "@/types";
import {
  formatMarketTime,
  getMarketDateKey,
  isHighlighted,
  keepPreviousHour,
  QUARTER_HOUR_MS,
} from "./dateUtils";

export const mergePriceIntervals = (
  todayPrices: PriceEntry[],
  tomorrowPrices: PriceEntry[],
  forecastPrices: ForecastPriceEntry[],
  now: Date,
): ChartPriceEntry[] => {
  const publishedPrices = [...todayPrices, ...tomorrowPrices];
  const publishedIntervals = publishedPrices.map((entry) => ({
    start: Date.parse(entry.time_start),
    end: Date.parse(entry.time_end),
  }));
  const seenForecastTimes = new Set<number>();
  const filteredForecast = forecastPrices.filter((entry) => {
    const start = Date.parse(entry.time_start);
    const end = Date.parse(entry.time_end);
    if (
      !keepPreviousHour(entry.time_start, now) ||
      seenForecastTimes.has(start) ||
      publishedIntervals.some(
        (interval) => start < interval.end && end > interval.start,
      )
    )
      return false;
    seenForecastTimes.add(start);
    return true;
  });
  const entries: ChartPriceEntry[] = [
    ...todayPrices.filter((entry) => keepPreviousHour(entry.time_start, now)),
    ...tomorrowPrices,
    ...filteredForecast,
  ].sort(
    (first, second) =>
      Date.parse(first.time_start) - Date.parse(second.time_start),
  );

  return entries;
};

export const transformData = (
  todayPrices: PriceEntry[],
  tomorrowPrices: PriceEntry[] = [],
  colorScheme: "light" | "dark",
  forecastPrices: ForecastPriceEntry[] = [],
  now: Date = new Date(),
): BarDataPoint[] => {
  const entries = mergePriceIntervals(todayPrices, tomorrowPrices, forecastPrices, now);
  if (entries.length === 0) return [];

  const slots = new Map<number, ChartPriceEntry>();
  entries.forEach((entry) => {
    const end = Date.parse(entry.time_end);
    for (let start = Date.parse(entry.time_start); start < end; start += QUARTER_HOUR_MS) {
      if (!slots.has(start)) {
        slots.set(start, {
          ...entry,
          time_start: new Date(start).toISOString(),
          time_end: new Date(Math.min(start + QUARTER_HOUR_MS, end)).toISOString(),
        });
      }
    }
  });

  const times = [...slots.keys()];
  const combinedData: BarDataPoint[] = [];
  const lastTime = Math.max(...times);
  for (let time = Math.min(...times); time <= lastTime; time += QUARTER_HOUR_MS) {
    const entry = slots.get(time);
    const date = new Date(time);
    const clock = formatMarketTime(date);
    const hours = Number(clock.slice(0, 2));
    const label = clock.endsWith(":00") && hours % 4 === 0
      ? forecastPrices.length > 0 && hours === 0
        ? getMarketDateKey(date).slice(5).split("-").reverse().map(Number).join("/")
        : clock.slice(0, 2)
      : undefined;
    combinedData.push({
      value: entry ? entry.SEK_per_kWh * 100 : 0,
      priceEntry: entry,
      label,
      disablePress: !entry,
      frontColor: !entry
        ? "transparent"
        : "isForecast" in entry
          ? Colors[colorScheme].forecastBar
          : isHighlighted(entry.time_start, entry.time_end, now)
            ? Colors.primary
            : Colors[colorScheme].chartBar,
    });
  }
  return combinedData;
};

export const getChartBounds = (data: BarDataPoint[]) => {
  const values = data.filter((entry) => entry.priceEntry).map((entry) => entry.value);
  return {
    maxValue: Math.ceil((Math.max(0, ...values) + 25) / 25) * 25,
    minValue: Math.floor(Math.min(0, ...values) / 20) * 20,
  };
};
