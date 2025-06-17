import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "app_theme_mode";

// Global state
let currentThemeMode: ThemeMode = "system";
let listeners: Array<() => void> = [];

// Notify all listeners when theme changes
const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

// Theme manager functions
export const ThemeManager = {
  // Get current theme mode
  getThemeMode: (): ThemeMode => currentThemeMode,

  // Set theme mode and save to storage
  setThemeMode: async (mode: ThemeMode) => {
    currentThemeMode = mode;
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      console.log("Theme saved:", mode);
      notifyListeners(); // Notify all components
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  },

  // Load theme from storage
  loadTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ["system", "light", "dark"].includes(saved)) {
        currentThemeMode = saved as ThemeMode;
      }
      notifyListeners();
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  },

  // Subscribe to theme changes
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  // Get actual color scheme based on current mode
  getColorScheme: (): "light" | "dark" => {
    if (currentThemeMode === "system") {
      // For system mode, we need to get the system scheme
      // This will be handled in the hook
      return "light"; // Default fallback
    }
    return currentThemeMode;
  },
};

// Initialize theme on module load
ThemeManager.loadTheme();
