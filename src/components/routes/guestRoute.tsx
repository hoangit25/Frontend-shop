// src/components/routes/guestRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

export default function GuestRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  // Điều kiện: Nếu ĐÃ có token => Chặn lại, đá sang trang đích trước đó (state.from) hoặc trang chủ
  if (accessToken) {
    const from =
      location.state?.from?.pathname
        ? `${location.state.from.pathname}${location.state.from.search || ""}`
        : typeof location.state?.from === "string"
        ? location.state.from
        : "/";

    return <Navigate to={from} replace />;
  }

  // Thỏa mãn (chưa đăng nhập) => Cho phép các route con (Login, Register...) render
  return <Outlet />;
}
