import { PriceChart } from "@/components/PriceChart";
import { PriceList } from "@/components/PriceRow";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useForecastPreference } from "@/hooks/useForecastPreference";
import { usePriceArea } from "@/hooks/usePriceArea";
import { usePriceData } from "@/hooks/usePriceData";
import { transformData } from "@/utils/chartUtils";
import { keepPreviousHour } from "@/utils/dateUtils";
import { getAreaName } from "@/utils/priceUtils";
import { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

export default function PricesScreen() {
  const { selectedArea, isLoading: areaLoading } = usePriceArea();
  const { showForecast } = useForecastPreference();
  const colorScheme = useColorScheme();

  const {
    prices,
    tomorrowPrices,
    loading,
    tomorrowLoading,
    error,
    tomorrowError,
    forecastPrices,
    forecastLoading,
    forecastError,
    now,
  } = usePriceData(selectedArea, areaLoading, showForecast);

  const filteredTodayPrices = useMemo(
    () => prices.filter((item) => keepPreviousHour(item.time_start, now)),
    [prices, now],
  );

  const chartData = useMemo(
    () =>
      transformData(prices, tomorrowPrices, colorScheme, forecastPrices, now),
    [prices, tomorrowPrices, colorScheme, forecastPrices, now],
  );
  const hasForecastBars = chartData.some(
    (item) => item.priceEntry && "isForecast" in item.priceEntry,
  );
  const showForecastStatus =
    showForecast &&
    ((forecastLoading && forecastPrices.length === 0) ||
      forecastError ||
      !hasForecastBars);

  if (areaLoading || (loading && prices.length === 0)) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>
          Dang, elpris-APIet svarar inte. Testa gärna att starta om appen.
          {error}
        </ThemedText>
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
          Elpriset
          <ThemedText type="titleLight">
            {" "}
            / {getAreaName(selectedArea)}
          </ThemedText>
        </ThemedText>
        <PriceChart data={chartData} colorScheme={colorScheme} />
        {showForecastStatus && (
          <View style={styles.forecastStatus}>
            {forecastLoading && forecastPrices.length === 0 ? (
              <ActivityIndicator size="small" />
            ) : forecastError ? (
              <ThemedText accessibilityRole="alert">{forecastError}</ThemedText>
            ) : (
              <ThemedText>Ingen prognos tillgänglig.</ThemedText>
            )}
          </View>
        )}
        <ThemedText type="subtitle">Idag</ThemedText>
        <PriceList prices={filteredTodayPrices} now={now} />

        <ThemedText type="subtitle" style={styles.tomorrowTitle}>
          Imorgon
        </ThemedText>

        {tomorrowLoading && tomorrowPrices.length === 0 ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <ThemedText>Hämtar morgondagens priser...</ThemedText>
          </ThemedView>
        ) : tomorrowPrices.length > 0 ? (
          <PriceList
            prices={tomorrowPrices}
            now={now}
            style={styles.tomorrowList}
          />
        ) : tomorrowError ? (
          <ThemedText accessibilityRole="alert" style={styles.messageText}>
            Kunde inte hämta morgondagens priser.
          </ThemedText>
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

const styles = StyleSheet.create({
  forecastStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  container: { flex: 1, paddingHorizontal: 20 },
  tomorrowTitle: {
    marginTop: 30,
  },
  tomorrowList: { marginBottom: 10 },
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
