import { Colors } from "@/constants/Colors";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    text: Colors.light.text,
    primary: Colors.primary,
  },
};

export const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    text: Colors.dark.text,
    primary: Colors.primary,
  },
};

export const getTheme = (colorScheme: "light" | "dark" | null) => {
  return colorScheme === "dark" ? AppDarkTheme : AppLightTheme;
};
