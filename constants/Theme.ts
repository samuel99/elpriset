import { Colors } from "@/constants/Colors";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background, // '#fff'
    text: Colors.light.text, // '#11181C'
    card: "#F8F9FA",
    border: "#E5E5E5",
    notification: "#6750A4",
    primary: Colors.light.tint, // '#0a7ea4'
    focus: "#6750A4",
  },
};

export const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background, // '#151718'
    text: Colors.dark.text, // '#ECEDEE'
    card: "#1E1E1E",
    border: "#333333",
    notification: "#BB86FC",
    primary: Colors.dark.tint, // '#fff'
    focus: "#6750A4",
  },
};

export const getTheme = (colorScheme: "light" | "dark" | null) => {
  return colorScheme === "dark" ? AppDarkTheme : AppLightTheme;
};
