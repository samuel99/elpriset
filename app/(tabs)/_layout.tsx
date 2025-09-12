import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { getTheme } from "@/constants/Theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{
        flex: 1,
        backgroundColor: Colors.dark.backgroundDark,
      }}
    >
      <Tabs
        screenOptions={{
          tabBarLabelPosition: "below-icon",
          tabBarActiveTintColor: theme.colors.primary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            justifyContent: "center",
            backgroundColor: Colors.dark.backgroundDark, // No theming here, always dark tab.
            elevation: 0,
            height: 68,
          },
          tabBarItemStyle: {},
          tabBarIconStyle: { margin: 5 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Priser",
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={28}
                name="chart.line.uptrend.xyaxis"
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Inställningar",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="gearshape.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
