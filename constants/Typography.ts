import { StyleSheet } from "react-native";

export const Typography = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    lineHeight: 32,
    marginBlock: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
    marginBlock: 16,
  },

  body: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },

  // Särskilda stilar
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    opacity: 0.7,
  },
  overline: {
    fontSize: 10,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
  },
});

// Färger för typografi (kan utökas)
export const TypographyColors = {
  primary: "#000000",
  secondary: "#666666",
  disabled: "#999999",
  accent: "#6750A4", // Material Design primary
  error: "#B3261E",
  success: "#4CAF50",
  warning: "#FF9800",
};
