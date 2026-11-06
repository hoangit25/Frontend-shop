// src/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { readStoredUser, useAuthStore } from "./components/store/auth-store";
import { http } from "./components/utils/axios-config";
import { router } from "./components/routes/index"; // Router của bạn

export default function App() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isLogin = localStorage.getItem('is_login')
        if(!isLogin){
          return;
        }
        // Gọi API ngầm đến backend lấy accessToken mới từ refreshToken trong cookie
        const res = await http.post<{ data: { accessToken: string } }>(
          "/auth/refresh",
          null
        );
        setAccessToken(res.data.data.accessToken);

        const storedUser = readStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        try {
          const profile = await http.get<{
            data: { fullName?: string; email?: string };
          }>("/users/me");
          const profileUser = profile.data.data;
          const email = profileUser.email?.trim() || storedUser?.email || "";
          const fullName = profileUser.fullName?.trim() || email;
          if (fullName) {
            setUser({ fullName, email });
          }
        } catch {
          if (!storedUser) {
            setUser({ fullName: "User", email: "" });
          }
        }
      } catch {
        // Nếu không có cookie hoặc refreshToken hết hạn => coi như chưa đăng nhập
        clearAuth();
      } finally {
        // Dù thành công hay thất bại, đánh dấu đã kiểm tra xong
        setInitialized(true);
      }
    };

    initAuth();
  }, [setAccessToken, setUser, setInitialized, clearAuth]);

  // 1. Khi đang kiểm tra cookie ngầm: Hiện màn hình chờ (tránh chớp nháy giao diện)
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm font-medium text-gray-500 animate-pulse">
          Đang tải ứng dụng...
        </div>
      </div>
    );
  }

  // 2. Sau khi đã kiểm tra xong: Render toàn bộ hệ thống Routes
  return <RouterProvider router={router} />;
}