// src/components/routes/index.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import GuestRoute from "./guestRoute";
import LayoutDefault from "../layouts/layout-default";
// import ProtectedRoute from "./protectedRoute";

// Import các trang
import LoginPage from "../pages/auth/login";
// import RegisterPage from "../pages/auth/register";
// import ProductsPage from "../pages/home/products";
// import ProfilePage from "../pages/user/profile";

export const router = createBrowserRouter([
  // -------------------------------------------------------------
  // 1. PUBLIC ROUTES: Ai cũng xem được (không cần guard)
  // -------------------------------------------------------------
  {
    path: "/",
    element: <LayoutDefault/>
  },

  // -------------------------------------------------------------
  // 2. GUEST ONLY ROUTES: Chỉ người CHƯA đăng nhập mới vào được
  // -------------------------------------------------------------
  {
    element: <GuestRoute />, // Guard kiểm tra tại đây
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      // {
      //   path: "/register",
      //   element: <RegisterPage />,
      // },
    ],
  },

  // -------------------------------------------------------------
  // 3. PROTECTED ROUTES: Chỉ người ĐÃ đăng nhập mới vào được
  // -------------------------------------------------------------
//   {
//     element: <ProtectedRoute />, // Guard kiểm tra tại đây
//     children: [
//       {
//         path: "/profile",
//         element: <div>Trang cá nhân của user (Private)</div>,
//       },
//       {
//         path: "/orders",
//         element: <div>Trang lịch sử đơn hàng (Private)</div>,
//       },
//     ],
//   },

  // 4. ROUTE 404 (Nếu không khớp trang nào)
  {
    path: "*",
    element: <div>404 - Trang không tồn tại</div>,
  },
]);

export default router;