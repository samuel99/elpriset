// Fallback for using SimpleLineIcons on Android and web.

import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof SimpleLineIcons>["name"]
>;
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
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and SimpleLineIcons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to SimpleLineIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SimpleLineIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
