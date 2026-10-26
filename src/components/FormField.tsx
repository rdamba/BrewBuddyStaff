import {
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";

// Accept every normal TextInput prop, plus two of our own.
interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function FormField({
  label,
  error,
  style,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        {...inputProps}
        placeholderTextColor="#9E9E9E"
        style={[styles.input, error ? styles.inputError : null, style]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3E2723",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0D6CC",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputError: { borderColor: "#B91C1C" },
  error: {
    color: "#B91C1C",
    fontSize: 12,
    marginTop: 4,
  },
});
