// src/components/routes/protectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

export default function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Điều kiện: Nếu CHƯA đăng nhập (không có token hoặc user) => Chặn lại, đá về trang /login
  // Kèm theo state `from` để sau khi login xong có thể quay lại đúng trang này
  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Thỏa mãn (đã đăng nhập) => Cho phép các route con (Profile, Orders, Checkout...) render
  return <Outlet />;
}