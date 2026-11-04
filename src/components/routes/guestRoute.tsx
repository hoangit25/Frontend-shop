// src/components/routes/guestRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

export default function GuestRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);

  // Điều kiện: Nếu ĐÃ có token => Chặn lại, đá sang trang sản phẩm/trang chủ
  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  // Thỏa mãn (chưa đăng nhập) => Cho phép các route con (Login, Register...) render
  return <Outlet />;
}
