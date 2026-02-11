import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePriceArea } from "@/hooks/usePriceArea";
import { usePriceData } from "@/hooks/usePriceData";
import { transformData } from "@/utils/chartUtils";
import { isHighlighted, keepPreviousHour } from "@/utils/dateUtils";
import {
  formatPrice,
  formatTime,
  getAreaName,
  getCurrentTime,
} from "@/utils/priceUtils";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  AppState,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function PricesScreen() {
  const { selectedArea, isLoading: areaLoading } = usePriceArea();
  const colorScheme = useColorScheme();
  const currentHourRef = useRef(getCurrentTime().getHours());

  const {
    prices,
    tomorrowPrices,
    loading,
    tomorrowLoading,
    error,
    tomorrowError,
    refetch,
  } = usePriceData(selectedArea, areaLoading);

  // Handle app state changes to refresh data when hour changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        const newHour = getCurrentTime().getHours();

        if (newHour !== currentHourRef.current) {
          currentHourRef.current = newHour;
          refetch();
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
    };
  }, [refetch]);

  // Memoized functions for performance optimization
  const getRowStyle = useCallback(
    (index: number, timeStart: string, timeEnd: string) => {
      const isHighlightedRow = isHighlighted(timeStart, timeEnd);
      const groupIndex = Math.floor(index / 4);
      const isEvenGroup = groupIndex % 2 === 0;

      if (isHighlightedRow) {
        return [styles.row, styles.currentHourRow];
      } else if (isEvenGroup) {
        return [styles.row, styles.evenRow];
      } else {
        return [styles.row, styles.oddRow];
      }
    },
    [],
  );

  const getTextStyle = useCallback((timeStart: string, timeEnd: string) => {
    const isCurrentHourTime = isHighlighted(timeStart, timeEnd);
    if (isCurrentHourTime) {
      return [styles.cell, styles.currentHourText];
    }
    return styles.cell;
  }, []);

  // Memoized filtered data to avoid recalculation on every render
  const filteredTodayPrices = useMemo(
    () => prices.filter((item) => keepPreviousHour(item.time_start)),
    [prices],
  );

  // Memoized chart data and calculations
  const chartData = useMemo(
    () => transformData(prices, tomorrowPrices, colorScheme ?? "light"),
    [prices, tomorrowPrices, colorScheme],
  );

  const { maxValue, minValue } = useMemo(() => {
    if (chartData.length === 0) return { maxValue: 0, minValue: 0 };
    const values = chartData.map((item) => item.value);
    const rawMax = Math.max(...values) + 25; // Add some padding to the max value to give place for the tooltip
    const rawMin = Math.min(...values);
    return {
      maxValue: Math.ceil(rawMax / 25) * 25, //Round up to closest 20 for nicer y axis values
      minValue: Math.floor(rawMin / 20) * 20, //Round down to closest 20 for nicer y axis values
    };
  }, [chartData]);

  // Render tooltip for bars
  const renderTooltip = useCallback(
    (item: any, index: number) => {
      const filteredToday = prices.filter((item) =>
        keepPreviousHour(item.time_start),
      );
      const allPrices = [...filteredToday, ...tomorrowPrices];

      if (index < allPrices.length) {
        const entry = allPrices[index];
        return (
          <View
            style={{
              marginBottom: 0,
              marginLeft: -20,
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: Colors.primary,
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: Colors.primaryAccent,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                {formatPrice(entry.SEK_per_kWh)}
              </Text>
              <Text
                style={{
                  color: Colors.primaryAccent,
                  fontSize: 10,
                  fontWeight: "400",
                }}
              >
                {formatTime(entry.time_start)}
              </Text>
            </View>
            <View
              style={{
                width: 0,
                height: 0,
                marginTop: -1,
                borderLeftWidth: 6,
                borderRightWidth: 6,
                borderTopWidth: 6,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: Colors.primary,
              }}
            />
          </View>
        );
      }
      return null;
    },
    [prices, tomorrowPrices],
  );

  // Early returns after all hooks have been called
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
        <View
          style={{
            flex: 1,
            marginInline: -12,
            marginBlock: 20,
          }}
        >
          <BarChart
            data={chartData}
            height={200}
            barWidth={8}
            spacing={1}
            stepValue={50}
            noOfSections={4}
            hideRules
            maxValue={maxValue}
            mostNegativeValue={minValue}
            yAxisThickness={0}
            yAxisColor={Colors[colorScheme].text}
            yAxisTextStyle={{
              fontSize: 16,
              textAlign: "right",
              color: Colors[colorScheme].text,
            }}
            xAxisThickness={1}
            autoShiftLabels
            labelWidth={20}
            xAxisLabelTextStyle={{
              fontSize: 16,
              textAlign: "center",
              marginInlineStart: -15,
              color: Colors[colorScheme].text,
            }}
            renderTooltip={renderTooltip}
            leftShiftForLastIndexTooltip={10}
          />
        </View>
        <ThemedText type="subtitle">Idag</ThemedText>
        <FlatList
          data={filteredTodayPrices}
          style={{ marginInline: -12 }}
          keyExtractor={(item, index) =>
            `today-${item?.time_start || index.toString()}`
          }
          renderItem={({ item, index }) => (
            <ThemedView
              style={getRowStyle(index, item.time_start, item.time_end)}
            >
              <ThemedText style={getTextStyle(item.time_start, item.time_end)}>
                {formatTime(item.time_start)}
              </ThemedText>
              <ThemedText style={getTextStyle(item.time_start, item.time_end)}>
                {formatPrice(item.SEK_per_kWh)} öre/kWh
              </ThemedText>
            </ThemedView>
          )}
          scrollEnabled={false}
        />

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
            style={{ marginInline: -12, marginBottom: 10 }}
            keyExtractor={(item, index) =>
              `tomorrow-${item?.time_start || index.toString()}`
            }
            renderItem={({ item, index }) => (
              <ThemedView
                style={getRowStyle(index, item.time_start, item.time_end)}
              >
                <ThemedText
                  style={getTextStyle(item.time_start, item.time_end)}
                >
                  {formatTime(item.time_start)}
                </ThemedText>
                <ThemedText
                  style={getTextStyle(item.time_start, item.time_end)}
                >
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

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
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
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  currentHourText: {
    color: Colors.primaryAccent,
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
