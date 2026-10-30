import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { useFonts } from "expo-font";
import { useEffect } from "react";

export function useAppFonts() {
  const [fontsLoaded, error] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  useEffect(() => {
    if (error) console.warn("Custom fonts unavailable; using system fonts.", error);
  }, [error]);

  return fontsLoaded || Boolean(error);
}
