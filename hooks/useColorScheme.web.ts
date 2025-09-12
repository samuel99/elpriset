import { ThemeManager } from "@/utils/ThemeManager";
import { useEffect, useState } from "react";

// Web-compatible system color scheme detection
const useWebSystemColorScheme = (): "light" | "dark" => {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateColorScheme = () => {
      setColorScheme(mediaQuery.matches ? "dark" : "light");
    };

    // Set initial value
    updateColorScheme();

    // Listen for changes
    mediaQuery.addEventListener("change", updateColorScheme);

    return () => {
      mediaQuery.removeEventListener("change", updateColorScheme);
    };
  }, []);

  return colorScheme;
};

/**
 * Web-specific implementation that properly supports theme switching
 */
export function useColorScheme() {
  const webSystemColorScheme = useWebSystemColorScheme();
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  // Initialize and update theme when dependencies change
  useEffect(() => {
    const themeMode = ThemeManager.getThemeMode();

    if (themeMode === "system") {
      setCurrentTheme(webSystemColorScheme ?? "light");
    } else {
      setCurrentTheme(themeMode);
    }
  }, [webSystemColorScheme]);

  useEffect(() => {
    // Subscribe to theme changes
    const unsubscribe = ThemeManager.subscribe(() => {
      const themeMode = ThemeManager.getThemeMode();

      if (themeMode === "system") {
        setCurrentTheme(webSystemColorScheme ?? "light");
      } else {
        setCurrentTheme(themeMode);
      }
    });

    return unsubscribe;
  }, [webSystemColorScheme]);

  // Update when system color scheme changes (for 'system' mode)
  useEffect(() => {
    const themeMode = ThemeManager.getThemeMode();
    if (themeMode === "system") {
      setCurrentTheme(webSystemColorScheme ?? "light");
    }
  }, [webSystemColorScheme]);

  return currentTheme;
}
