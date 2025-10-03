/**
 * UI-related types for components and user interactions
 */

import type { ThemeMode } from "./data";

/**
 * Price area option for dropdown/selection components
 */
export type PriceAreaOption = {
  value: string;
  label: string;
};

/**
 * Theme option for theme selection components
 */
export type ThemeOption = {
  value: ThemeMode;
  label: string;
};

/**
 * Navigation tab configuration
 */
export type TabConfig = {
  name: string;
  title: string;
  icon?: string;
};

/**
 * Color scheme type for theming
 */
export type ColorScheme = "light" | "dark" | null;
