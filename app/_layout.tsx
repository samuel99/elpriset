import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { getTheme } from "@/constants/Theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAppFonts } from "@/hooks/useFonts";
import { View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return null;
  }

  const theme = getTheme(colorScheme);

  return (
    <ThemeProvider value={theme}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingTop: 45,
        }}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </View>
    </ThemeProvider>
  );
}
