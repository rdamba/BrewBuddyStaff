import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/apiError";
import { drinkService } from "../services/drinkService";
import type { Drink, DrinkInput, DrinkUpdate } from "../types/drink";

export function useDrinks() {
  const { token, signOut } = useAuth();

  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // A 401 means the token is no longer valid: send the user to login.
  const checkAuth = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        void signOut();
      }
    },
    [signOut],
  );

  // READ
  const load = useCallback(async () => {
    if (!token) return;

    try {
      setError("");
      const data = await drinkService.list(token);
      setDrinks(data);
    } catch (err) {
      checkAuth(err);
      setError(err instanceof Error ? err.message : "Could not load the menu.");
    }
  }, [token, checkAuth]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // CREATE
  const addDrink = useCallback(
    async (input: DrinkInput) => {
      if (!token) return;

      try {
        const created = await drinkService.create(token, input);
        setDrinks((prev) => [...prev, created]);
      } catch (err) {
        checkAuth(err);
        throw err;
      }
    },
    [token, checkAuth],
  );

  // UPDATE
  const editDrink = useCallback(
    async (id: number, changes: DrinkUpdate) => {
      if (!token) return;

      try {
        const updated = await drinkService.update(token, id, changes);
        setDrinks((prev) => prev.map((d) => (d.id === id ? updated : d)));
      } catch (err) {
        checkAuth(err);
        throw err;
      }
    },
    [token, checkAuth],
  );

  // DELETE (optimistic: remove first, put it back if the server refuses)
  const removeDrink = useCallback(
    async (id: number) => {
      if (!token) return;

      const snapshot = drinks;
      setDrinks((prev) => prev.filter((d) => d.id !== id));

      try {
        await drinkService.remove(token, id);
      } catch (err) {
        setDrinks(snapshot);
        checkAuth(err);
        throw err;
      }
    },
    [token, drinks, checkAuth],
  );

  return {
    drinks,
    loading,
    refreshing,
    error,
    refresh,
    addDrink,
    editDrink,
    removeDrink,
  };
}
