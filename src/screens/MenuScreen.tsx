import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryChips, { type ChipOption } from "../components/CategoryChips";
import DrinkCard from "../components/DrinkCard";
import DrinkForm from "../components/DrinkForm";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { useDrinks } from "../hooks/useDrinks";
import type { Category, Drink, DrinkInput } from "../types/drink";

type Filter = "all" | Category;

const FILTER_OPTIONS: ChipOption<Filter>[] = [
  { value: "all", label: "All" },
  { value: "hot", label: "Hot" },
  { value: "cold", label: "Cold" },
];

export default function MenuScreen() {
  const { user, signOut } = useAuth();
  const {
    drinks,
    loading,
    refreshing,
    error,
    refresh,
    addDrink,
    editDrink,
    removeDrink,
  } = useDrinks();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Drink | null>(null);

  const isManager = user?.role === "manager";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return drinks.filter(
      (d) =>
        (filter === "all" || d.category === filter) &&
        d.name.toLowerCase().includes(q),
    );
  }, [drinks, filter, query]);

  const soldOut = useMemo(
    () => drinks.filter((d) => !d.available).length,
    [drinks],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(drink: Drink) {
    setEditing(drink);
    setFormOpen(true);
  }

  async function handleSubmit(input: DrinkInput) {
    if (editing) {
      await editDrink(editing.id, input);
    } else {
      await addDrink(input);
    }
  }

  function toggleAvailable(drink: Drink) {
    editDrink(drink.id, { available: !drink.available }).catch((err: Error) =>
      Alert.alert("Update failed", err.message),
    );
  }

  function confirmDelete(drink: Drink) {
    Alert.alert("Delete drink", `Remove ${drink.name} from the menu?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removeDrink(drink.id).catch((err: Error) =>
            Alert.alert("Could not delete", err.message),
          );
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centre}>
        <ActivityIndicator size="large" color="#3E2723" />
        <Text style={styles.muted}>Brewing the menu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name.split(" ")[0]}</Text>
          <Text style={styles.muted}>
            {drinks.length} drinks · {soldOut} sold out · {user?.role}
          </Text>
        </View>

        <PrimaryButton label="Sign out" variant="secondary" onPress={signOut} />
      </View>

      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error}</Text>
          <Text style={styles.retry} onPress={refresh}>
            Retry
          </Text>
        </View>
      ) : null}

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search the menu"
        placeholderTextColor="#9E9E9E"
        style={styles.search}
      />

      <CategoryChips
        options={FILTER_OPTIONS}
        selected={filter}
        onSelect={setFilter}
      />

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DrinkCard
            drink={item}
            canDelete={isManager}
            onEdit={openEdit}
            onDelete={confirmDelete}
            onToggleAvailable={toggleAvailable}
          />
        )}
        refreshing={refreshing}
        onRefresh={refresh}
        ListEmptyComponent={
          <Text style={styles.muted}>No drinks match that search.</Text>
        }
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.fab}>
        <PrimaryButton label="+ Add drink" onPress={openCreate} />
      </View>

      <DrinkForm
        visible={formOpen}
        drink={editing}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3E2723",
  },
  muted: {
    color: "#9E9E9E",
    marginTop: 4,
    textAlign: "center",
  },
  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  bannerText: {
    color: "#B91C1C",
    flex: 1,
  },
  retry: {
    color: "#3E2723",
    fontWeight: "700",
    marginLeft: 12,
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 32,
  },
});
