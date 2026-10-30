/**
 * Utility functions for price formatting and time operations
 */

import type { PriceArea } from "@/types";
import { formatMarketTime } from "./dateUtils";

export { getCurrentTime } from "./dateUtils";

/**
 * Format time from ISO string to HH:MM format
 */
export const formatTime = (timeStart: string): string => {
  return formatMarketTime(new Date(timeStart));
};

/**
 * Format price from SEK per kWh to öre/kWh with Swedish locale
 */
export const formatPrice = (pricePerKWh: number): string => {
  return (pricePerKWh * 100).toLocaleString("sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

/**
 * Get area display name
 */
export const getAreaName = (area: PriceArea): string => area;
