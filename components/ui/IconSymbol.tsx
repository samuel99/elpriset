// Fallback for using SimpleLineIcons on Android and web.

import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import type { SymbolWeight } from "expo-symbols";
import type { ComponentProps } from "react";
import type { StyleProp, TextStyle } from "react-native";
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to SimpleLineIcons mappings here.
 * - see SimpleLineIcons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "chart.line.uptrend.xyaxis": "graph",
  "gearshape.fill": "settings",
  "checkmark.circle.fill": "check",
} as const satisfies Record<string, ComponentProps<typeof SimpleLineIcons>["name"]>;

/**
 * SF Symbol-style names mapped to SimpleLineIcons on every platform.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: TextStyle["color"];
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SimpleLineIcons
      size={size}
      name={MAPPING[name]}
      style={[{ color: color ?? undefined }, style]}
    />
  );
}
