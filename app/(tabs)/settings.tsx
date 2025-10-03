import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { usePriceArea } from "@/hooks/usePriceArea";
import { useThemeMode } from "@/hooks/useThemeMode";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import type { PriceAreaOption, ThemeOption } from "@/types";

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
                  color={Colors.primaryAccent}
                />
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>

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
                  color={Colors.dark.background}
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
    borderColor: "rgba(123, 123, 123, 0.25)",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
  },
  selectedOptionLabel: {
    color: Colors.primaryAccent,
    backgroundColor: Colors.primary,
  },
  link: {
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
    color: Colors.primary,
  },
});
