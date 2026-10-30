import { useThemeMode } from "./useThemeMode";

export function useColorScheme() {
  return useThemeMode().actualColorScheme;
}
