import { PlatformPressable } from "expo-router/react-navigation";
import type { ComponentProps } from "react";

export function HapticTab(props: ComponentProps<typeof PlatformPressable>) {
  return <PlatformPressable {...props} />;
}
