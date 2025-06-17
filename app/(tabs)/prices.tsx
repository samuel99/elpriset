import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useElområde } from "@/hooks/useElområde";

type PriceEntry = {
  SEK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
};

export default function PricesScreen() {
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedArea, isLoading: areaLoading } = useElområde();

  useEffect(() => {
    if (!areaLoading && selectedArea) {
      setLoading(true);
      setError(null);
      fetchPrices(selectedArea)
        .then((data) => {
          setPrices(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [selectedArea, areaLoading]);
  const getAreaName = (area: string) => {
    const names: Record<string, string> = {
      SE1: "SE1 - Norra Sverige",
      SE2: "SE2 - Norra Mellansverige",
      SE3: "SE3 - Södra Mellansverige",
      SE4: "SE4 - Södra Sverige",
    };
    return names[area] || area;
  };

  if (areaLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          Fel vid hämtning: {error}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Elpris {getAreaName(selectedArea)}
      </ThemedText>
      <FlatList
        data={prices}
        keyExtractor={(item, index) => item?.time_start || index.toString()}
        renderItem={({ item }) => (
          <ThemedView style={styles.row}>
            <ThemedText style={styles.cell}>
              {new Date(item.time_start).getHours()}:00
            </ThemedText>
            <ThemedText style={styles.cell}>
              {(item.SEK_per_kWh * 100).toFixed(1)} öre/kWh
            </ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

async function fetchPrices(area: string): Promise<PriceEntry[]> {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const monthDay = dateObj.toISOString().split("T")[0].slice(5); // "MM-DD"
  const url = `https://www.elprisetjustnu.se/api/v1/prices/${year}/${monthDay}_${area}.json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20 },
  title: { marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  cell: { fontSize: 16 },
  errorText: { fontSize: 16 },
});
