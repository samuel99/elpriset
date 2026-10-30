import type { ThemeMode } from "@/types";
import { themeStore } from "@/utils/ThemeManager";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { usePreference } from "./usePreference";

// Re-export ThemeMode for convenience
export type { ThemeMode };

export function useThemeMode() {
  const systemColorScheme = useSystemColorScheme();
  const state = usePreference(themeStore);
  const themeMode = state.value;
  const actualColorScheme =
    themeMode === "system" ? (systemColorScheme ?? "light") : themeMode;

  return {
    themeMode,
    setThemeMode: themeStore.setValue,
    actualColorScheme,
    isLoading: state.isLoading,
    error: state.error,
  };
}
