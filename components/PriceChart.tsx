import { PriceTooltip } from "@/components/PriceTooltip";
import { Colors } from "@/constants/Colors";
import type { BarDataPoint } from "@/types";
import { getChartBounds } from "@/utils/chartUtils";
import { useRef, useState } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

const BAR_WIDTH = 8;
const BAR_SPACING = 1;

export function PriceChart({
  data,
  colorScheme,
}: {
  data: BarDataPoint[];
  colorScheme: "light" | "dark";
}) {
  const { maxValue, minValue } = getChartBounds(data);
  const textColor = Colors[colorScheme].text;
  const { width: windowWidth } = useWindowDimensions();
  const [chartWidth, setChartWidth] = useState(Math.max(windowWidth - 60, 1));
  const scrollOffset = useRef(0);
  const renderTooltip = (item: BarDataPoint, index: number) => (
    <PriceTooltip
      item={item}
      barWidth={BAR_WIDTH}
      leftOffset={index * (BAR_WIDTH + BAR_SPACING) - scrollOffset.current}
      viewportWidth={chartWidth}
    />
  );
  return (
    <View
      style={styles.container}
      onLayout={(event) =>
        setChartWidth(Math.max(event.nativeEvent.layout.width - 44, 1))
      }
    >
      <BarChart
        data={data}
        width={chartWidth}
        height={200}
        barWidth={BAR_WIDTH}
        spacing={BAR_SPACING}
        initialSpacing={0}
        endSpacing={48}
        yAxisExtraHeight={80}
        stepValue={maxValue / 4}
        noOfSections={4}
        hideRules
        maxValue={maxValue}
        mostNegativeValue={minValue}
        yAxisThickness={0}
        yAxisColor={textColor}
        yAxisTextStyle={[styles.axisText, { color: textColor }]}
        xAxisThickness={1}
        autoShiftLabels
        labelWidth={44}
        xAxisLabelTextStyle={[
          styles.axisText,
          styles.xAxisText,
          { color: textColor },
        ]}
        renderTooltip={renderTooltip}
        autoCenterTooltip
        scrollEventThrottle={16}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollOffset.current = event.nativeEvent.contentOffset.x;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 350, flexShrink: 0, marginInline: -12, marginBlock: 20 },
  axisText: { fontSize: 16, textAlign: "right" },
  xAxisText: { textAlign: "center", marginInlineStart: -15 },
});
