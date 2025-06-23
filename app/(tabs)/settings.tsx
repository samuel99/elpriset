import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { usePriceArea } from "@/hooks/usePriceArea";
import { ThemeMode, useThemeMode } from "@/hooks/useThemeMode";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type PriceAreaOption = {
  value: string;
  label: string;
};

type ThemeOption = {
  value: ThemeMode;
  label: string;
};

const PRICE_AREAS: PriceAreaOption[] = [
  { value: "SE1", label: "SE1, Norra Sverige" },
  {
    value: "SE2",
    label: "SE2, Norra Mellansverige",
  },
  {
    value: "SE3",
    label: "SE3, Södra Mellansverige",
  },
  { value: "SE4", label: "SE4, Södra Sverige" },
];

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
  const { selectedArea, setSelectedArea } = usePriceArea();
  const { themeMode, setThemeMode, isLoading: themeLoading } = useThemeMode();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Inställningar</ThemedText>

        {/* Elprisområde sektion */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Elprisområde
          </ThemedText>
          {PRICE_AREAS.map((area) => (
            <TouchableOpacity
              key={area.value}
              style={[
                styles.option,
                selectedArea === area.value && styles.selectedOption,
              ]}
              onPress={() => setSelectedArea(area.value)}
            >
              <ThemedView style={styles.optionContent}>
                <ThemedText
                  style={[
                    styles.optionLabel,
                    selectedArea === area.value && styles.selectedOptionLabel,
                  ]}
                >
                  {area.label}
                </ThemedText>
              </ThemedView>
              {selectedArea === area.value && (
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={16}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* Tema sektion */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Utseende
          </ThemedText>
          {THEME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                themeMode === option.value && styles.selectedOption,
              ]}
              onPress={() => setThemeMode(option.value)}
              disabled={themeLoading}
            >
              <ThemedView style={styles.optionContent}>
                <ThemedText
                  style={[
                    styles.optionLabel,
                    themeMode === option.value && styles.selectedOptionLabel,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </ThemedView>
              {themeMode === option.value && (
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={16}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          ))}
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
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.12)",

    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  selectedOption: {
    borderColor: "#6750A4", // Material Purple Primary
    backgroundColor: "#6750A4", // Material Purple with low opacity
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
  },
  selectedOptionLabel: {
    color: "#fff", // Material Purple Primary
    backgroundColor: "#6750A4", // Material Purple with low opacity
  },
  link: {
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
    color: "#6750A4", // Match the link color from ThemedText
  },
});
