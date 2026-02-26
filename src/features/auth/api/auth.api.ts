import { delay } from "@/mocks/handlers";
import { MOCK_USERS, generateMockToken } from "@/mocks/auth.mock";
import type {
  AuthResponse,
  LoginCredentials,
  User,
} from "../types/auth.types";

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  await delay(400);

  const user = MOCK_USERS.find(
    (u) =>
      u.email === credentials.email && u.password === credentials.password,
  );

  if (!user) {
    throw new Error("Rangt netfang eða lykilorð");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return {
    user: safeUser,
    token: generateMockToken(user.id),
  };
}

export async function logout(): Promise<void> {
  await delay(200);
}

export async function getCurrentUser(token: string): Promise<User> {
  await delay(200);

  const userId = token.split("-")[2];
  const user = MOCK_USERS.find((u) => u.id === userId);

  if (!user) {
    throw new Error("Invalid token");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return safeUser;
}
