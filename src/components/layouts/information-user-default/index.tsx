import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./sidebar-default";
import Header from "./header-default";
import { useAuthStore } from "../../store/auth-store";

interface LayoutDefaultProps {
  children?: ReactNode;
}

const LayoutDefault = ({ children }: LayoutDefaultProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default LayoutDefault;