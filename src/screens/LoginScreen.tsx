import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/FormField";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { useForm, type FormErrors } from "../hooks/useForm";
import type { LoginCredentials } from "../types/auth";

function validate(values: LoginCredentials): FormErrors<LoginCredentials> {
  const errors: FormErrors<LoginCredentials> = {};

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export default function LoginScreen() {
  const { signIn } = useAuth();

  const { values, errors, setField, validateAll } = useForm<LoginCredentials>(
    { email: "", password: "" },
    validate,
  );

  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  async function handleLogin() {
    if (!validateAll()) return;

    setSubmitting(true);
    setAuthError("");

    try {
      await signIn(values);
      // On success, AuthProvider changes the authentication status.
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Sign-in failed.");
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        <Text style={styles.brand}>BrewBuddy Staff</Text>
        <Text style={styles.subtitle}>Sign in to manage today's menu</Text>

        <View style={styles.card}>
          <FormField
            label="Email"
            value={values.email}
            onChangeText={(text) => setField("email", text)}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@brewbuddy.pg"
            error={errors.email}
          />

          <FormField
            label="Password"
            value={values.password}
            onChangeText={(text) => setField("password", text)}
            secureTextEntry
            placeholder="••••••••"
            error={errors.password}
          />

          {authError ? <Text style={styles.authError}>{authError}</Text> : null}

          <PrimaryButton
            label="Sign in"
            onPress={handleLogin}
            loading={submitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: "#3E2723",
    textAlign: "center",
  },
  subtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  authError: {
    color: "#B91C1C",
    marginBottom: 12,
    textAlign: "center",
  },
});
