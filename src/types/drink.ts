export type Category = "hot" | "cold";

export interface Drink {
  id: number;
  name: string;
  price: number;
  category: Category;
  available: boolean;
}

// What the client sends when creating: everything except the id,
// because the server assigns ids.
export type DrinkInput = Omit<Drink, "id">;

// What the client sends when updating: any subset of the fields.
export type DrinkUpdate = Partial<DrinkInput>;
