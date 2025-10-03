/**
 * Core data types for the electricity price application
 */

/**
 * Electricity price entry from the API
 */
export type PriceEntry = {
  SEK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
};

/**
 * Price area identifier (SE1, SE2, SE3, SE4)
 */
export type PriceArea = "SE1" | "SE2" | "SE3" | "SE4";

/**
 * Theme mode options
 */
export type ThemeMode = "light" | "dark" | "system";
