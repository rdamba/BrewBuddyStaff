import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import MenuScreen from "../screens/MenuScreen";

// The first route. Chooses a screen from the auth status.
export default function Index() {
  const { status } = useAuth();

  if (status === "checking") {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#3E2723" />
      </View>
    );
  }

  return status === "signedIn" ? <MenuScreen /> : <LoginScreen />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8F0",
  },
});
