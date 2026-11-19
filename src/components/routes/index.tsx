// src/components/routes/index.tsx
import { createBrowserRouter } from "react-router-dom";
import GuestRoute from "./guestRoute";
import ProtectedRoute from "./protectedRoute";
import LayoutDefault from "../layouts/layout-default";

// Import các trang
import LoginPage from "../pages/auth/login";
import HomePage from "../pages/home/index";
import RegisterPage from "../pages/auth/register";
import ForgotPassword from "../pages/auth/forgotPassword/index";
import ProductsPage from "../pages/products/ProductsPage";
import ProductDetail from "../pages/products/item";
import CartPage from "../pages/cart/index";
import CheckoutPage from "../pages/cart/checkout";
import PaymentReturnPage from "../pages/checkout/payment-return";
import OrderDetailPage from "../pages/order/order-detail";
import UserLayout from "../layouts/information-user-default";
import ProfilePage from "../pages/user/index";
import OrderListUserId from "../pages/order/order-list-userId";

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
      {
        path: "/product-detail/:id",
        element: <ProductDetail />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout/payment-return",
        element: <PaymentReturnPage />,
      },
    ],
  },

  // -------------------------------------------------------------
  // 2. GUEST ONLY ROUTES: Chỉ người CHƯA đăng nhập mới vào được
  // -------------------------------------------------------------
  {
    element: <GuestRoute />,
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
  // 3. PROTECTED ROUTES: Cần đăng nhập
  // -------------------------------------------------------------
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        element: <UserLayout />,
        children: [
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/orders",
            element: <OrderListUserId />,
          },
        ],
      },
      {
        path: "/orders/:id",
        element: <OrderDetailPage />,
      },
    ],
  },

  // -------------------------------------------------------------
  // 4. ROUTE 404 (Nếu không khớp trang nào)
  // -------------------------------------------------------------
  {
    path: "*",
    element: <div>404 - Trang không tồn tại</div>,
  },
]);
