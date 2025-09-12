import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { getTheme } from "@/constants/Theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAppFonts } from "@/hooks/useFonts";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return null;
  }

  const theme = getTheme(colorScheme);

  return (
    <ThemeProvider value={theme}>
      <SafeAreaView
        edges={["top"]}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </SafeAreaView>
    </ThemeProvider>
  );
}
