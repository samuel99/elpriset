import { Colors } from "@/constants/Colors";
import type { BarDataPoint, PriceEntry } from "@/types";
import { isHighlighted, keepPreviousHour } from "./dateUtils";

/**
 * Transform price data into chart data points
 */
export const transformData = (
  todayPrices: PriceEntry[],
  tomorrowPrices: PriceEntry[] = [],
  colorScheme: "light" | "dark"
): BarDataPoint[] => {
  const combinedData: BarDataPoint[] = [];

  // Add today's prices
  todayPrices.forEach((entry) => {
    const date = new Date(entry.time_start);

    // Skip entries that are more than 1 hour in the past
    if (!keepPreviousHour(entry.time_start)) {
      return;
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Only show label every 4th hour and only for exact hour (00 minutes)
    const shouldShowLabel = hours % 4 === 0 && minutes === 0;

    combinedData.push({
      value: entry.SEK_per_kWh * 100,
      ...(shouldShowLabel && {
        label: `${hours.toString().padStart(2, "0")}`,
      }),
      frontColor: isHighlighted(entry.time_start, entry.time_end)
        ? Colors.primary
        : Colors[colorScheme].chartBar,
    });
  });

  // Add tomorrow's prices if available
  if (tomorrowPrices.length > 0) {
    tomorrowPrices.forEach((entry) => {
      const date = new Date(entry.time_start);
      const hours = date.getHours();
      const minutes = date.getMinutes();

      // Only show label every 4th hour and only for exact hour (00 minutes)
      const shouldShowLabel = hours % 4 === 0 && minutes === 0;

      combinedData.push({
        value: entry.SEK_per_kWh * 100,
        ...(shouldShowLabel && {
          label: `${hours.toString().padStart(2, "0")}`,
        }),
        frontColor: Colors[colorScheme].chartBar,
      });
    });
  }

  return combinedData;
};
