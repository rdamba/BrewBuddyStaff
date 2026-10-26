import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type Variant = "primary" | "secondary" | "danger";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? "#3E2723" : "#fff"}
        />
      ) : (
        <Text
          style={[styles.label, variant === "secondary" && styles.labelDark]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: "#3E2723" },
  secondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#3E2723",
  },
  danger: { backgroundColor: "#B91C1C" },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  label: { color: "#fff", fontWeight: "600", fontSize: 15 },
  labelDark: { color: "#3E2723" },
});
