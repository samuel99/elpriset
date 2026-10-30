export const MARKET_TIME_ZONE = "Europe/Stockholm";
export const QUARTER_HOUR_MS = 15 * 60 * 1000;

const marketDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: MARKET_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const marketTimeFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: MARKET_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export const getCurrentTime = () => new Date();

export function getMarketDateKey(date: Date): string {
  const parts = marketDateFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function addMarketDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const formatMarketTime = (date: Date): string => marketTimeFormatter.format(date);

export const formatMarketDate = (date: Date): string =>
  date.toLocaleDateString("sv-SE", {
    timeZone: MARKET_TIME_ZONE,
    day: "numeric",
    month: "short",
  });

export const isHighlighted = (
  timeStart: string,
  timeEnd: string,
  now: Date = getCurrentTime(),
): boolean => now.getTime() >= Date.parse(timeStart) && now.getTime() < Date.parse(timeEnd);

export const keepPreviousHour = (
  timeStart: string,
  now: Date = getCurrentTime(),
): boolean => {
  const previousHourStart = Math.floor(now.getTime() / 3600000) * 3600000 - 3600000;
  return Date.parse(timeStart) >= previousHourStart;
};
