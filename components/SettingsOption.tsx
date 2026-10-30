import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function SettingsOption({ label, selected, disabled = false, onPress }: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.selectedOption]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityLabel={label}
      aria-checked={selected}
      accessibilityState={{ checked: selected, disabled }}
    >
      <View style={styles.content}>
        <ThemedText style={[styles.label, selected && styles.selectedLabel]}>{label}</ThemedText>
      </View>
      {selected && <IconSymbol name="checkmark.circle.fill" size={16} color={Colors.primaryAccent} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(123, 123, 123, 0.25)",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
  },
  selectedOption: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  content: { flex: 1 },
  label: { fontSize: 16 },
  selectedLabel: { color: Colors.primaryAccent },
});