const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  includeAuth = true,
): Promise<T> {
  const token =
    includeAuth && typeof window !== "undefined"
      ? window.localStorage.getItem("auth_token")
      : null;

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    // If it's a network error (backend not running), provide helpful message
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Backend server is not running. Please start the .NET backend on port 5000.");
    }
    throw error;
  }
}

export async function login(username: string, password: string) {
  const data = await apiFetch<AuthResponse>("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  }, false);

  if (typeof window !== "undefined") {
    window.localStorage.setItem("auth_token", data.token);
    window.localStorage.setItem(
      "auth_user",
      JSON.stringify({ username: data.username, role: data.role }),
    );
  }

  return data;
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  role: "Player" | "Admin" = "Player",
) {
  return apiFetch<AuthResponse>(
    "/api/Auth/register",
    {
      method: "POST",
      body: JSON.stringify({ username, email, password, role }),
    },
    false,
  );
}

export type UserProfile = {
  id: number;
  username: string;
  email?: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
};

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { username: string; role: string };
  } catch {
    return null;
  }
}

