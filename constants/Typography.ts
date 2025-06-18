import { StyleSheet } from "react-native";

export const Typography = StyleSheet.create({
  title: {
    fontSize: 28,
    fontFamily: "Roboto_700Bold",
    lineHeight: 32,
    marginBlock: 16,
  },
  titleLight: {
    fontSize: 28,
    fontFamily: "Roboto_300Light",
    lineHeight: 32,
    marginBlock: 16,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "Roboto_500Medium",
    lineHeight: 24,
    marginBlock: 16,
  },
  body: {
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    lineHeight: 20,
  },
});

export const TypographyColors = {
  primary: "#000000",
  secondary: "#666666",
  disabled: "#999999",
  accent: "#6750A4",
  error: "#B3261E",
  success: "#4CAF50",
  warning: "#FF9800",
};
