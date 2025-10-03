import { Colors } from "@/constants/Colors";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    backgroundDark: Colors.light.backgroundDark,
    text: Colors.light.text,
    primary: Colors.primary,
    chartBar: Colors.light.chartBar,
  },
};

export const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    backgroundDark: Colors.dark.backgroundDark,
    text: Colors.dark.text,
    primary: Colors.primary,
    chartBar: Colors.dark.chartBar,
  },
};

export const getTheme = (colorScheme: "light" | "dark" | null) => {
  return colorScheme === "dark" ? AppDarkTheme : AppLightTheme;
};
