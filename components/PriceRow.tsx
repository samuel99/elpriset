import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import type { PriceEntry } from "@/types";
import { isHighlighted } from "@/utils/dateUtils";
import { formatPrice, formatTime } from "@/utils/priceUtils";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

export function PriceRow({
  entry,
  index,
  now,
}: {
  entry: PriceEntry;
  index: number;
  now: Date;
}) {
  const highlighted = isHighlighted(entry.time_start, entry.time_end, now);
  const textStyle = [styles.cell, highlighted && styles.highlightedText];
  return (
    <ThemedView
      style={[
        styles.row,
        Math.floor(index / 4) % 2 === 0 ? styles.evenRow : styles.oddRow,
        highlighted && styles.highlightedRow,
      ]}
    >
      <ThemedText style={textStyle}>{formatTime(entry.time_start)}</ThemedText>
      <ThemedText style={textStyle}>
        {formatPrice(entry.SEK_per_kWh)} öre/kWh
      </ThemedText>
    </ThemedView>
  );
}

export function PriceList({
  prices,
  now,
  style,
}: {
  prices: PriceEntry[];
  now: Date;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.list, style]}>
      {prices.map((entry, index) => (
        <PriceRow
          key={entry.time_start}
          entry={entry}
          index={index}
          now={now}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { marginInline: -12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  evenRow: { backgroundColor: "rgba(128, 128, 128, 0.1)" },
  oddRow: { backgroundColor: "transparent" },
  highlightedRow: { backgroundColor: Colors.primary, borderRadius: 6 },
  highlightedText: { color: Colors.primaryAccent },
  cell: { fontSize: 16 },
});
