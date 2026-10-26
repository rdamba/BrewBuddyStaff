import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useForm, type FormErrors } from "../hooks/useForm";
import type { Category, Drink, DrinkInput } from "../types/drink";
import CategoryChips, { type ChipOption } from "./CategoryChips";
import FormField from "./FormField";
import PrimaryButton from "./PrimaryButton";

// Form values are strings where the user types, so price is a string here.
interface DrinkFormValues {
  name: string;
  price: string;
  category: Category;
  available: boolean;
}

interface DrinkFormProps {
  visible: boolean;
  drink: Drink | null; // null = create, a Drink = edit
  onSubmit: (input: DrinkInput) => Promise<void>;
  onClose: () => void;
}

const CATEGORY_OPTIONS: ChipOption<Category>[] = [
  { value: "hot", label: "Hot" },
  { value: "cold", label: "Cold" },
];

function toFormValues(drink: Drink | null): DrinkFormValues {
  if (!drink) {
    return {
      name: "",
      price: "",
      category: "hot",
      available: true,
    };
  }

  return {
    name: drink.name,
    price: drink.price.toFixed(2),
    category: drink.category,
    available: drink.available,
  };
}

function validate(values: DrinkFormValues): FormErrors<DrinkFormValues> {
  const errors: FormErrors<DrinkFormValues> = {};

  if (values.name.trim().length < 2) {
    errors.name = "Enter at least 2 characters.";
  }

  const price = Number(values.price);

  if (!values.price || Number.isNaN(price) || price <= 0) {
    errors.price = "Enter a price above zero, e.g. 8.50";
  }

  return errors;
}

export default function DrinkForm({
  visible,
  drink,
  onSubmit,
  onClose,
}: DrinkFormProps) {
  const { values, errors, setField, validateAll, reset } = useForm(
    toFormValues(drink),
    validate,
  );

  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const isEditing = drink !== null;

  // Each time the modal opens, load the right starting values.
  useEffect(() => {
    if (visible) {
      reset(toFormValues(drink));
      setServerError("");
    }
  }, [visible, drink, reset]);

  async function handleSave() {
    if (!validateAll()) return;

    setSaving(true);
    setServerError("");

    try {
      await onSubmit({
        name: values.name.trim(),
        price: Number(values.price),
        category: values.category,
        available: values.available,
      });

      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>
            {isEditing ? "Edit drink" : "New drink"}
          </Text>

          <FormField
            label="Name"
            value={values.name}
            onChangeText={(text) => setField("name", text)}
            placeholder="e.g. Mocha"
            error={errors.name}
          />

          <FormField
            label="Price (K)"
            value={values.price}
            onChangeText={(text) => setField("price", text)}
            keyboardType="decimal-pad"
            placeholder="8.50"
            error={errors.price}
          />

          <Text style={styles.label}>Category</Text>

          <CategoryChips
            options={CATEGORY_OPTIONS}
            selected={values.category}
            onSelect={(category) => setField("category", category)}
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Available today</Text>
            <Switch
              value={values.available}
              onValueChange={(on) => setField("available", on)}
            />
          </View>

          {serverError ? (
            <Text style={styles.serverError}>{serverError}</Text>
          ) : null}

          <View style={styles.buttons}>
            <View style={styles.buttonSlot}>
              <PrimaryButton
                label="Cancel"
                variant="secondary"
                onPress={onClose}
                disabled={saving}
              />
            </View>

            <View style={styles.buttonSlot}>
              <PrimaryButton
                label={isEditing ? "Save changes" : "Add drink"}
                onPress={handleSave}
                loading={saving}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#FFF8F0",
    padding: 20,
    paddingBottom: 36,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3E2723",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3E2723",
    marginBottom: 6,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  serverError: {
    color: "#B91C1C",
    marginBottom: 12,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  buttonSlot: {
    flex: 1,
  },
});
