import { Pressable, StyleSheet, Text, View } from "react-native";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface CategoryChipsProps<T extends string> {
  options: ChipOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export default function CategoryChips<T extends string>({
  options,
  selected,
  onSelect,
}: CategoryChipsProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.value === selected;

        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C68B59",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#C68B59",
  },
  text: {
    color: "#3E2723",
    fontWeight: "500",
  },
  textActive: {
    color: "#fff",
  },
});
