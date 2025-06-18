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
      fetchPricesForDate(selectedArea)
        .then((data) => {
          setPrices(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });

      // Hämta morgondagens priser
      fetchPricesForDate(selectedArea, 1)
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

  const formatPrice = (pricePerKWh: number) => {
    return (pricePerKWh * 100).toLocaleString("sv-SE", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
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

  const getTextStyle = (timeStart: string) => {
    const isCurrentHourTime = isCurrentHour(timeStart);
    if (isCurrentHourTime) {
      return [styles.cell, styles.currentHourText];
    }
    return styles.cell;
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">
          Timpris {getAreaName(selectedArea)}
        </ThemedText>

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
              <ThemedText style={getTextStyle(item.time_start)}>
                {formatTime(item.time_start)}
              </ThemedText>
              <ThemedText style={getTextStyle(item.time_start)}>
                {formatPrice(item.SEK_per_kWh)} öre/kWh
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
                <ThemedText style={getTextStyle(item.time_start)}>
                  {formatTime(item.time_start)}
                </ThemedText>
                <ThemedText style={getTextStyle(item.time_start)}>
                  {formatPrice(item.SEK_per_kWh)} öre/kWh
                </ThemedText>
              </ThemedView>
            )}
            scrollEnabled={false}
          />
        ) : (
          <ThemedView style={styles.messageContainer}>
            <ThemedText style={styles.messageText}>
              Morgondagens elpriser publiceras 14:00
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

async function fetchPricesForDate(
  area: string,
  daysOffset: number = 0
): Promise<PriceEntry[]> {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysOffset);

  const dateStr =
    targetDate.getFullYear() +
    "-" +
    String(targetDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(targetDate.getDate()).padStart(2, "0");

  const url = `https://www.elprisetjustnu.se/api/v1/prices/${targetDate.getFullYear()}/${dateStr.slice(
    5
  )}_${area}.json`;

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
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  oddRow: {
    backgroundColor: "transparent",
  },
  currentHourRow: {
    backgroundColor: "#6750A4",
    borderRadius: 6,
  },
  currentHourText: {
    color: "#FFFFFF",
  },
  cell: { fontSize: 16 },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  messageContainer: {
    backgroundColor: "transparent",
  },
  messageText: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 100,
  },
});
