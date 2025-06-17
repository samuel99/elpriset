import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useElområde } from "@/hooks/useElområde";

type ElområdeOption = {
  value: string;
  label: string;
  description: string;
};

const ELOMRÅDEN: ElområdeOption[] = [
  { value: "SE1", label: "SE1 - Norra Sverige", description: "Luleå" },
  {
    value: "SE2",
    label: "SE2 - Norra Mellansverige",
    description: "Sundsvall",
  },
  {
    value: "SE3",
    label: "SE3 - Södra Mellansverige",
    description: "Stockholm",
  },
  { value: "SE4", label: "SE4 - Södra Sverige", description: "Malmö" },
];

const STORAGE_KEY = "selected_elområde";

export default function SettingsScreen() {
  const { selectedArea, setSelectedArea } = useElområde();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Inställningar
      </ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Välj elprisområde
        </ThemedText>
        {ELOMRÅDEN.map((område) => (
          <TouchableOpacity
            key={område.value}
            style={[
              styles.option,
              selectedArea === område.value && styles.selectedOption,
            ]}
            onPress={() => setSelectedArea(område.value)}
          >
            <ThemedView style={styles.optionContent}>
              <ThemedText style={styles.optionLabel}>{område.label}</ThemedText>
              <ThemedText style={styles.optionDescription}>
                {område.description}
              </ThemedText>
            </ThemedView>
            {selectedArea === område.value && (
              <ThemedText style={styles.checkmark}>✓</ThemedText>
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 30,
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
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#E6F3FF",
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "bold",
  },
});
