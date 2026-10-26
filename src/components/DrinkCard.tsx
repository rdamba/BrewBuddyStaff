import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { Drink } from "../types/drink";

interface DrinkCardProps {
  drink: Drink;
  canDelete: boolean;
  onEdit: (drink: Drink) => void;
  onDelete: (drink: Drink) => void;
  onToggleAvailable: (drink: Drink) => void;
}

export default function DrinkCard({
  drink,
  canDelete,
  onEdit,
  onDelete,
  onToggleAvailable,
}: DrinkCardProps) {
  const thumbColour = drink.category === "hot" ? "#C68B59" : "#7BA7BC";

  return (
    <View style={[styles.card, !drink.available && styles.cardMuted]}>
      <View style={[styles.thumb, { backgroundColor: thumbColour }]} />

      <View style={styles.info}>
        <Text style={styles.name}>{drink.name}</Text>
        <Text style={styles.price}>K{drink.price.toFixed(2)}</Text>

        {!drink.available && <Text style={styles.badge}>Sold out</Text>}

        <View style={styles.actions}>
          <Pressable onPress={() => onEdit(drink)} hitSlop={8}>
            <Text style={styles.link}>Edit</Text>
          </Pressable>

          {canDelete && (
            <Pressable onPress={() => onDelete(drink)} hitSlop={8}>
              <Text style={[styles.link, styles.danger]}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Switch
        value={drink.available}
        onValueChange={() => onToggleAvailable(drink)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardMuted: {
    opacity: 0.6,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3E2723",
  },
  price: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  badge: {
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: "600",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 6,
  },
  link: {
    color: "#3E2723",
    fontWeight: "600",
  },
  danger: {
    color: "#B91C1C",
  },
});
