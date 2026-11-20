import { useAuthStore } from "../store/auth-store";
import {http} from "./axios-config"

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = http
      .post("/auth/refresh")
      .then((res) => {
        const accessToken = res.data.data.accessToken;

        useAuthStore.getState().setAccessToken(accessToken);

        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};