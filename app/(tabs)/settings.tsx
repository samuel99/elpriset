import { SettingsOption } from "@/components/SettingsOption";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { PRICE_AREAS } from "@/constants/PriceAreas";
import { useForecastPreference } from "@/hooks/useForecastPreference";
import { usePriceArea } from "@/hooks/usePriceArea";
import { useThemeMode } from "@/hooks/useThemeMode";
import { Linking, ScrollView, StyleSheet } from "react-native";

import type { ThemeOption } from "@/types";

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "system",
    label: "System",
  },
  {
    value: "light",
    label: "Ljust",
  },
  {
    value: "dark",
    label: "Mörkt",
  },
];

export default function SettingsScreen() {
  const {
    selectedArea,
    setSelectedArea,
    isLoading: areaLoading,
    error: areaError,
  } = usePriceArea();
  const {
    showForecast,
    setShowForecast,
    isLoading: forecastLoading,
    error: forecastError,
  } = useForecastPreference();
  const {
    themeMode,
    setThemeMode,
    isLoading: themeLoading,
    error: themeError,
  } = useThemeMode();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Inställningar</ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Elprisområde
          </ThemedText>
          {PRICE_AREAS.map((area) => (
            <SettingsOption
              key={area.value}
              label={area.label}
              selected={selectedArea === area.value}
              disabled={areaLoading}
              onPress={() => setSelectedArea(area.value)}
            />
          ))}
          {areaError && (
            <ThemedText accessibilityRole="alert">{areaError}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Tredagars prisprognos (beta)
          </ThemedText>
          {[
            { value: true, label: "Ja" },
            { value: false, label: "Nej" },
          ].map((option) => (
            <SettingsOption
              key={option.label}
              label={option.label}
              selected={showForecast === option.value}
              onPress={() => setShowForecast(option.value)}
              disabled={forecastLoading}
            />
          ))}
          {forecastError && (
            <ThemedText accessibilityRole="alert">{forecastError}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Utseende
          </ThemedText>
          {THEME_OPTIONS.map((option) => (
            <SettingsOption
              key={option.value}
              label={option.label}
              selected={themeMode === option.value}
              onPress={() => setThemeMode(option.value)}
              disabled={themeLoading}
            />
          ))}
          {themeError && (
            <ThemedText accessibilityRole="alert">{themeError}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Om
          </ThemedText>
          <ThemedView>
            <ThemedText>
              Elpriser tillhandahålls av{" "}
              <ThemedText
                style={styles.link}
                onPress={() =>
                  Linking.openURL("https://www.elprisetjustnu.se/elpris-api")
                }
              >
                Elprisetjustnu.se
              </ThemedText>
              .
            </ThemedText>
            <ThemedText style={{ marginBlock: 10 }}>
              Elprisprognos tillhandahålls av{" "}
              <ThemedText
                style={styles.link}
                onPress={() => Linking.openURL("https://wolta.se")}
              >
                Wolta.se
              </ThemedText>
              .
            </ThemedText>
            <ThemedText style={{ marginBlock: 10 }}>
              Kod tillgänglig på{" "}
              <ThemedText
                style={styles.link}
                onPress={() =>
                  Linking.openURL("https://github.com/samuel99/elpriset")
                }
              >
                GitHub
              </ThemedText>
              .
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  link: {
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
    color: Colors.primary,
  },
});
