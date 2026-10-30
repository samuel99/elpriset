import { Colors } from "@/constants/Colors";
import type { BarDataPoint } from "@/types";
import { formatMarketDate } from "@/utils/dateUtils";
import { formatPrice, formatTime } from "@/utils/priceUtils";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function PriceTooltip({ item, barWidth = 8, leftOffset = Infinity, viewportWidth }: {
  item: BarDataPoint;
  barWidth?: number;
  leftOffset?: number;
  viewportWidth?: number;
}) {
  const [width, setWidth] = useState(0);
  const leftShift = Math.max(0, (width - barWidth) / 2 - leftOffset);
  const rightShift = viewportWidth === undefined
    ? 0
    : Math.min(0, viewportWidth - leftOffset - (width + barWidth) / 2);
  const edgeShift = leftShift || rightShift;
  const entry = item.priceEntry;
  if (!entry) return null;
  return (
    <View
      style={[styles.container, { transform: [{ translateX: edgeShift }] }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.bubble}>
        <Text style={styles.price}>{formatPrice(entry.SEK_per_kWh)}</Text>
        <Text style={styles.time}>{formatTime(entry.time_start)}</Text>
        {"isForecast" in entry && (
          <Text style={styles.time}>Prognos {formatMarketDate(new Date(entry.time_start))}</Text>
        )}
      </View>
      <View style={[styles.arrow, { transform: [{ translateX: -edgeShift }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  bubble: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  price: { color: Colors.primaryAccent, fontSize: 11, fontWeight: "600" },
  time: { color: Colors.primaryAccent, fontSize: 10, fontWeight: "400" },
  arrow: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.primary,
  },
});