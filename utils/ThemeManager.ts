import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type ThemeMode = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "app_theme_mode";

let currentThemeMode: ThemeMode = "system";
let listeners: Array<() => void> = [];
let isInitialized = false;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error("Storage getItem error:", error);
    return null;
  }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Storage setItem error:", error);
  }
};

export const ThemeManager = {
  getThemeMode: (): ThemeMode => currentThemeMode,

  setThemeMode: async (mode: ThemeMode) => {
    currentThemeMode = mode;
    try {
      await setStorageItem(THEME_STORAGE_KEY, mode);
      notifyListeners();
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  },

  loadTheme: async () => {
    try {
      const saved = await getStorageItem(THEME_STORAGE_KEY);
      if (saved && ["system", "light", "dark"].includes(saved)) {
        currentThemeMode = saved as ThemeMode;
      }
      isInitialized = true;
      notifyListeners();
    } catch (error) {
      console.error("Failed to load theme:", error);
      isInitialized = true;
    }
  },

  isInitialized: () => isInitialized,

  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  getColorScheme: (): "light" | "dark" => {
    if (currentThemeMode === "system") {
      return "light";
    }
    return currentThemeMode;
  },
};

if (
  Platform.OS !== "web" ||
  (typeof window !== "undefined" && window.localStorage)
) {
  ThemeManager.loadTheme();
}
