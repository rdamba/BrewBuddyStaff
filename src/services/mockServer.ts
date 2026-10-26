import type { AuthResponse, LoginCredentials, User } from "../types/auth";
import type { Drink, DrinkInput } from "../types/drink";
import { ApiError } from "./apiError";

const LATENCY_MS = 600;

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

type StoredUser = User & { password: string };

const users: StoredUser[] = [
  {
    id: 1,
    name: "Grace Kila",
    email: "manager@brewbuddy.pg",
    password: "latte123",
    role: "manager",
  },
  {
    id: 2,
    name: "Tom Wari",
    email: "staff@brewbuddy.pg",
    password: "mocha123",
    role: "staff",
  },
];

let drinks: Drink[] = [
  {
    id: 1,
    name: "Flat White",
    price: 8.5,
    category: "hot",
    available: true,
  },
  {
    id: 2,
    name: "Long Black",
    price: 7.0,
    category: "hot",
    available: true,
  },
  {
    id: 3,
    name: "Iced Latte",
    price: 9.5,
    category: "cold",
    available: true,
  },
  {
    id: 4,
    name: "Mocha",
    price: 9.0,
    category: "hot",
    available: false,
  },
  {
    id: 5,
    name: "Cold Brew",
    price: 10.0,
    category: "cold",
    available: true,
  },
];

let nextId = 6;

// Never send the password back to the client.
function toPublicUser({ password: _password, ...user }: StoredUser): User {
  return user;
}

function userFromToken(token?: string | null): User {
  const match = token?.match(/^demo-token-(\d+)$/);

  const user = match ? users.find((u) => u.id === Number(match[1])) : undefined;

  if (!user) {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  return toPublicUser(user);
}

function validateDrink(input: Partial<DrinkInput>) {
  if (input.name !== undefined && input.name.trim().length < 2) {
    throw new ApiError(422, "Name must be at least 2 characters.");
  }

  if (
    input.price !== undefined &&
    (!Number.isFinite(input.price) || input.price <= 0)
  ) {
    throw new ApiError(422, "Price must be greater than zero.");
  }
}

export async function mockRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  await wait(LATENCY_MS);

  // Public route: the only one that works without a token.
  if (method === "POST" && path === "/auth/login") {
    const { email, password } = body as LoginCredentials;

    const user = users.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    );

    if (!user) {
      throw new ApiError(401, "Incorrect email or password.");
    }

    const result: AuthResponse = {
      token: `demo-token-${user.id}`,
      user: toPublicUser(user),
    };

    return result as T;
  }

  // Every route below this line requires a valid token.
  const currentUser = userFromToken(token);

  if (method === "GET" && path === "/auth/me") {
    return currentUser as T;
  }

  if (method === "GET" && path === "/drinks") {
    return [...drinks] as T;
  }

  if (method === "POST" && path === "/drinks") {
    const input = body as DrinkInput;
    validateDrink(input);

    const created: Drink = {
      ...input,
      name: input.name.trim(),
      id: nextId++,
    };

    drinks = [...drinks, created];

    return created as T;
  }

  const match = path.match(/^\/drinks\/(\d+)$/);

  if (match) {
    const id = Number(match[1]);
    const existing = drinks.find((d) => d.id === id);

    if (!existing) {
      throw new ApiError(404, "That drink no longer exists.");
    }

    if (method === "PATCH") {
      const changes = body as Partial<DrinkInput>;
      validateDrink(changes);

      const updated: Drink = {
        ...existing,
        ...changes,
        id,
      };

      drinks = drinks.map((d) => (d.id === id ? updated : d));

      return updated as T;
    }

    if (method === "DELETE") {
      if (currentUser.role !== "manager") {
        throw new ApiError(403, "Only managers can delete drinks.");
      }

      drinks = drinks.filter((d) => d.id !== id);

      return undefined as T;
    }
  }

  throw new ApiError(404, `No route for ${method} ${path}`);
}
