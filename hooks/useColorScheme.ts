import { useColorScheme as useSystemColorScheme } from "react-native";
import { useThemeMode } from "./useThemeMode";

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const { themeMode, actualColorScheme } = useThemeMode();

  // Return the actual color scheme based on user's theme mode setting
  return actualColorScheme ?? systemColorScheme ?? "light";
}
