// src/components/routes/index.tsx
import { createBrowserRouter } from "react-router-dom";
import GuestRoute from "./guestRoute";
import LayoutDefault from "../layouts/layout-default";
// import ProtectedRoute from "./protectedRoute";

// Import các trang
import LoginPage from "../pages/auth/login";
import HomePage from "../pages/home/index";
import RegisterPage from "../pages/auth/register";
import ForgotPassword from "../pages/auth/forgotPassword/index";
import ProductsPage from "../pages/products/ProductsPage";
// import ProfilePage from "../pages/user/profile";

export const router = createBrowserRouter([
  // -------------------------------------------------------------
  // 1. PUBLIC ROUTES: Ai cũng xem được (không cần guard)
  // -------------------------------------------------------------
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
    ],
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
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },

  // -------------------------------------------------------------
  // 3. ROUTE 404 (Nếu không khớp trang nào)
  // -------------------------------------------------------------
  {
    path: "*",
    element: <div>404 - Trang không tồn tại</div>,
  },
]);
