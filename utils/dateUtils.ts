import { getCurrentTime } from "./priceUtils";

/**
 * Check if a time period is currently highlighted (active)
 */
export const isHighlighted = (timeStart: string, timeEnd: string): boolean => {
  const now = getCurrentTime();
  const priceStart = new Date(timeStart);
  const priceEnd = new Date(timeEnd);

  return now >= priceStart && now < priceEnd;
};

/**
 * Always keeps at least one complete previous hour
 */
export const keepPreviousHour = (timeStart: string): boolean => {
  const now = getCurrentTime();

  // Get the start of the previous hour
  const previousHourStart = new Date(now);
  previousHourStart.setHours(now.getHours() - 1);
  previousHourStart.setMinutes(0);
  previousHourStart.setSeconds(0);
  previousHourStart.setMilliseconds(0);

  const entryTime = new Date(timeStart);

  return entryTime >= previousHourStart;
};
