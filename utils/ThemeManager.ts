import type { ThemeMode } from "@/types";
import { createPreferenceStore } from "./createPreferenceStore";

export const themeStore = createPreferenceStore<ThemeMode>(
  "app_theme_mode",
  "system",
  (saved) => saved === "light" || saved === "dark" ? saved : "system",
);

export const ThemeManager = {
  getThemeMode: () => themeStore.getSnapshot().value,
  setThemeMode: themeStore.setValue,
  loadTheme: themeStore.load,
  isInitialized: () => !themeStore.getSnapshot().isLoading,
  subscribe: themeStore.subscribe,
};
