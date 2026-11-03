
import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isInitialized : boolean
  setAccessToken: (token: string) => void;
  setInitialized: (val: boolean) =>void; 
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isInitialized: false,

  setAccessToken: (token) => {
    set({ accessToken: token });
  },
  setInitialized: (val)=>{
    set({
        isInitialized:val  })
  },
  clearAuth: () => {
    set({ accessToken: null });
  },
}));
