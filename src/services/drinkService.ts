import type { Drink, DrinkInput, DrinkUpdate } from "../types/drink";
import { request } from "./apiClient";

export const drinkService = {
  // Read list:
  list: (token: string) => request<Drink[]>("GET", "/drinks", { token }),

  // Create
  create: (token: string, input: DrinkInput) =>
    request<Drink>("POST", "/drinks", { token, body: input }),

  // Update
  update: (token: string, id: number, changes: DrinkUpdate) =>
    request<Drink>("PATCH", `/drinks/${id}`, { token, body: changes }),

  // Delete
  remove: (token: string, id: number) =>
    request<void>("DELETE", `/drinks/${id}`, { token }),
};
