/**
 * UI-related types for components and user interactions
 */

import type { PriceArea, ThemeMode } from "./data";

/**
 * Price area option for dropdown/selection components
 */
export type PriceAreaOption = {
  value: PriceArea;
  label: string;
};

/**
 * Theme option for theme selection components
 */
export type ThemeOption = {
  value: ThemeMode;
  label: string;
};
