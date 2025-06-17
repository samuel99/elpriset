import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "app_theme_mode";

export function useThemeMode() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme mode on mount
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Save theme mode when it changes (but not on initial load)
  useEffect(() => {
    if (!isLoading) {
      saveThemeMode(themeMode);
    }
  }, [themeMode, isLoading]);

  const loadThemeMode = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ["system", "light", "dark"].includes(saved)) {
        setThemeMode(saved as ThemeMode);
      }
    } catch (error) {
      console.error("Failed to load theme mode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      console.log("Theme mode saved:", mode); // Debug log
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  };

  // Calculate actual color scheme based on mode
  const actualColorScheme =
    themeMode === "system" ? systemColorScheme : themeMode;

  const setThemeModeWithDebug = (mode: ThemeMode) => {
    console.log("Setting theme mode to:", mode); // Debug log
    setThemeMode(mode);
  };

  return {
    themeMode,
    setThemeMode: setThemeModeWithDebug,
    actualColorScheme,
    isLoading,
  };
}
