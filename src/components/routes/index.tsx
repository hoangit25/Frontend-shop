// src/components/routes/index.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import GuestRoute from "./guestRoute";
import LayoutDefault from "../layouts/layout-default";
// import ProtectedRoute from "./protectedRoute";

// Import các trang
import LoginPage from "../pages/auth/login";
import HomePage from "../pages/home/index"
import RegisterPage from "../pages/auth/register";
// import ProductsPage from "../pages/home/products";
// import ProfilePage from "../pages/user/profile";

export const router = createBrowserRouter([
  // -------------------------------------------------------------
  // 1. PUBLIC ROUTES: Ai cũng xem được (không cần guard)
  // -------------------------------------------------------------
  {
    path: "/",
    element: <LayoutDefault/>,
    children:[
      {
        index:true,
        element:<HomePage/>
      }
      
    ]
  },
  {
        path:"/register" ,      
        element:<RegisterPage/>
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

  {
    path: "*",
    element: <div>404 - Trang không tồn tại</div>,
  },
]);

export default router;