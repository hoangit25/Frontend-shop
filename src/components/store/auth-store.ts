
import { create } from "zustand";

const USER_STORAGE_KEY = "auth_user";

export interface AuthUser {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isInitialized: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  setInitialized: (val: boolean) => void;
  clearAuth: () => void;
}

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    const email = parsed.email?.trim() ?? "";
    const fullName = parsed.fullName?.trim() || email;
    if (!fullName && !email) return null;
    return {
      id: parsed.id || parsed._id || "",
      _id: parsed._id || parsed.id || "",
      fullName: fullName || "",
      email: email || "",
      phone: parsed.phone || "",
      avatar: parsed.avatar || "",
    };
  } catch {
    return null;
  }
}

export function persistUser(user: AuthUser) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,

  setAccessToken: (token) => {
    set({ accessToken: token });
  },
  setUser: (user) => {
    persistUser(user);
    set({ user });
  },
  setInitialized: (val) => {
    set({ isInitialized: val });
  },
  clearAuth: () => {
    localStorage.removeItem("is_login");
    localStorage.removeItem(USER_STORAGE_KEY);
    set({ accessToken: null, user: null });
  },
}));

export { readStoredUser };
