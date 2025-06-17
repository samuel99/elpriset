import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { usePriceArea } from "@/hooks/usePriceArea";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";

type PriceEntry = {
  SEK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
};

export default function PricesScreen() {
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [tomorrowPrices, setTomorrowPrices] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tomorrowLoading, setTomorrowLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tomorrowError, setTomorrowError] = useState<string | null>(null);
  const { selectedArea, isLoading: areaLoading } = usePriceArea();
  useEffect(() => {
    if (!areaLoading && selectedArea) {
      setLoading(true);
      setTomorrowLoading(true);
      setError(null);
      setTomorrowError(null);
      // Hämta dagens priser
      fetchPrices(selectedArea)
        .then((data) => {
          setPrices(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });

      // Hämta morgondagens priser
      fetchTomorrowPrices(selectedArea)
        .then((data: PriceEntry[]) => {
          setTomorrowPrices(data);
          setTomorrowLoading(false);
          setTomorrowError(null);
        })
        .catch((err: any) => {
          setTomorrowPrices([]);
          setTomorrowLoading(false);
          setTomorrowError(err.message);
        });
    }
  }, [selectedArea, areaLoading]);
  const getAreaName = (area: string) => {
    const names: Record<string, string> = {
      SE1: "SE1",
      SE2: "SE2",
      SE3: "SE3",
      SE4: "SE4",
    };
    return names[area] || area;
  };

  const formatTime = (timeStart: string) => {
    const hour = new Date(timeStart).getHours();
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  const isCurrentHour = (timeStart: string) => {
    const now = new Date();
    const priceTime = new Date(timeStart);
    return (
      priceTime.getDate() === now.getDate() &&
      priceTime.getMonth() === now.getMonth() &&
      priceTime.getFullYear() === now.getFullYear() &&
      priceTime.getHours() === now.getHours()
    );
  };

  const getRowStyle = (index: number, timeStart: string) => {
    const isCurrentHourTime = isCurrentHour(timeStart);
    const isEvenRow = index % 2 === 0;

    if (isCurrentHourTime) {
      return [styles.row, styles.currentHourRow];
    } else if (isEvenRow) {
      return [styles.row, styles.evenRow];
    } else {
      return [styles.row, styles.oddRow];
    }
  };
  if (areaLoading || loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Fel vid hämtning: {error}</ThemedText>
      </ThemedView>
    );
  }
  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title">Timpris {getAreaName(selectedArea)}</ThemedText>

      {/* Dagens priser */}
      <ThemedText type="subtitle">Idag</ThemedText>
      <FlatList
        data={prices}
        style={{ marginInline: -12 }}
        keyExtractor={(item, index) =>
          `today-${item?.time_start || index.toString()}`
        }
        renderItem={({ item, index }) => (
          <ThemedView style={getRowStyle(index, item.time_start)}>
            <ThemedText style={styles.cell}>
              {formatTime(item.time_start)}
            </ThemedText>
            <ThemedText style={styles.cell}>
              {(item.SEK_per_kWh * 100).toFixed(1)} öre/kWh
            </ThemedText>
          </ThemedView>
        )}
        scrollEnabled={false}
      />

      {/* Morgondagens priser */}
      <ThemedText type="subtitle" style={styles.tomorrowTitle}>
        Imorgon
      </ThemedText>

      {tomorrowLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <ThemedText>Hämtar morgondagens priser...</ThemedText>
        </ThemedView>
      ) : tomorrowPrices.length > 0 ? (
        <FlatList
          data={tomorrowPrices}
          style={{ marginInline: -12, marginBottom: 100 }}
          keyExtractor={(item, index) =>
            `tomorrow-${item?.time_start || index.toString()}`
          }
          renderItem={({ item, index }) => (
            <ThemedView style={getRowStyle(index, item.time_start)}>
              <ThemedText style={styles.cell}>
                {formatTime(item.time_start)}
              </ThemedText>
              <ThemedText style={styles.cell}>
                {(item.SEK_per_kWh * 100).toFixed(1)} öre/kWh
              </ThemedText>
            </ThemedView>
          )}
          scrollEnabled={false}
        />
      ) : (
        <ThemedView style={styles.messageContainer}>
          <ThemedText style={styles.messageText}>
            Morgondagens priser publiceras klockan 14.
          </ThemedText>
        </ThemedView>
      )}
    </ScrollView>
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

async function fetchTomorrowPrices(area: string): Promise<PriceEntry[]> {
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() + 1); // Morgondagens datum
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
  tomorrowTitle: {
    marginTop: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  evenRow: {
    backgroundColor: "rgba(128, 128, 128, 0.1)", // Mycket subtil grå
  },
  oddRow: {
    backgroundColor: "transparent",
  },
  currentHourRow: {
    backgroundColor: "#6750A4", // Subtil blå för aktuell timme
    borderRadius: 6,
  },
  cell: { fontSize: 16 },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  messageContainer: {
    paddingVertical: 15,
    alignItems: "center",
  },
  messageText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
});
