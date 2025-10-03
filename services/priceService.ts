import { API_CONFIG, buildPriceUrl } from "@/config/api";
import type { PriceEntry } from "@/types";

/**
 * Fetch electricity prices for a specific area and date
 */
export async function fetchPricesForDate(
  area: string,
  daysOffset: number = 0
): Promise<PriceEntry[]> {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysOffset);

  const url = buildPriceUrl(area, targetDate);
  // For testing: const url = DEMO_URL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${API_CONFIG.TIMEOUT}ms`);
      }
      throw error;
    }

    throw new Error("Unknown error occurred while fetching prices");
  }
}
