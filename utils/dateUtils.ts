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
 * Check if an entry is within the last hour (not too far in the past)
 */
export const isWithinLastHour = (timeStart: string): boolean => {
  const now = getCurrentTime();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const entryTime = new Date(timeStart);

  return entryTime >= oneHourAgo;
};
