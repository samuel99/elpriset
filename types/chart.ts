import type { ChartPriceEntry } from "./data";

/**
 * Chart-related types for data visualization
 */

/**
 * Data point for bar chart visualization
 */
export type BarDataPoint = {
  value: number;
  label?: string;
  frontColor?: string;
  priceEntry?: ChartPriceEntry;
  disablePress?: boolean;
};
