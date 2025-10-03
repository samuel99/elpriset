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

  const dateStr =
    targetDate.getFullYear() +
    "-" +
    String(targetDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(targetDate.getDate()).padStart(2, "0");

  const url = `https://www.elprisetjustnu.se/api/v1/prices/${targetDate.getFullYear()}/${dateStr.slice(
    5
  )}_${area}.json`;
  //const url = "https://www.elprisetjustnu.se/api/v1/prices/kvartspris_demo.json";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
