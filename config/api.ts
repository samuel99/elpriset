import type { PriceArea } from "@/types";
import { getMarketDateKey } from "@/utils/dateUtils";

/**
 * API Configuration with environment variables
 * Single source of truth with sensible defaults
 */
export const API_CONFIG = {
  BASE_URL:
    process.env.EXPO_PUBLIC_API_URL || "https://www.elprisetjustnu.se/api/v1",
  FORECAST_URL:
    process.env.EXPO_PUBLIC_API_URL_FORECAST ||
    "https://wolta.se/api/v1/prices/forecast",
  TIMEOUT:
    Number(process.env.EXPO_PUBLIC_API_TIMEOUT) > 0
      ? Number(process.env.EXPO_PUBLIC_API_TIMEOUT)
      : 5000,
} as const;

/**
 * Build API URL for price data
 */
export const buildPriceUrl = (area: PriceArea, date: Date | string): string => {
  const dateKey = typeof date === "string" ? date : getMarketDateKey(date);
  return `${API_CONFIG.BASE_URL.replace(/\/$/, "")}/prices/${dateKey.slice(0, 4)}/${dateKey.slice(5)}_${area}.json`;
};
