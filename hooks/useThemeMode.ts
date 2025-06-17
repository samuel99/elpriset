import { ThemeManager, ThemeMode } from "@/utils/ThemeManager";
import { useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export function useThemeMode() {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    ThemeManager.getThemeMode()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to theme changes
    const unsubscribe = ThemeManager.subscribe(() => {
      setThemeMode(ThemeManager.getThemeMode());
    });

    // Load initial theme
    ThemeManager.loadTheme().then(() => {
      setThemeMode(ThemeManager.getThemeMode());
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Calculate actual color scheme
  const actualColorScheme =
    themeMode === "system" ? systemColorScheme : themeMode;

  const setThemeModeWrapper = (mode: ThemeMode) => {
    ThemeManager.setThemeMode(mode);
  };

  return {
    themeMode,
    setThemeMode: setThemeModeWrapper,
    actualColorScheme,
    isLoading,
  };
}

export type { ThemeMode };
