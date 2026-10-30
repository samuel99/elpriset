import { Typography } from "@/constants/Typography";
import { useThemeColor } from "@/hooks/useThemeColor";
import { isLoaded } from "expo-font";
import { Platform, StyleSheet, Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "titleLight"
    | "defaultSemiBold"
    | "subtitle"
    | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? Typography.body : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "title" ? Typography.title : undefined,
        type === "titleLight" ? Typography.titleLight : undefined,
        type === "subtitle" ? Typography.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        !isLoaded("Roboto_400Regular") && styles.fallbackFont,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  defaultSemiBold: { ...Typography.body, fontFamily: "Roboto_500Medium" },
  fallbackFont: { fontFamily: Platform.OS === "ios" ? "System" : "sans-serif" },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
