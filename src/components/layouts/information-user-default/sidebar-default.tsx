import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Lock,
  MapPin,
  Heart,
  FileText,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store";
import { authService } from "../../api/auth/auth-service";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue client logout even if server fails
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  const menuItems = [
    {
      title: "Thông tin cá nhân",
      path: "/profile",
      icon: UserRound,
    },
    {
      title: "Đổi mật khẩu",
      path: "/change-password",
      icon: Lock,
    },
    {
      title: "Quản lý địa chỉ",
      path: "/addresses",
      icon: MapPin,
    },
    {
      title: "Yêu thích",
      path: "/favorites",
      icon: Heart,
    },
  ];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <Link
        to="/"
        className="flex h-20 items-center gap-2 px-6 transition hover:opacity-85"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white shadow-sm">
          <ShoppingBag size={20} />
        </div>

        <span className="text-2xl font-bold tracking-tight text-green-700">
          Account
        </span>
      </Link>

      {/* User brief card */}
      <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3 border border-gray-100">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="Avatar"
            className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            {user?.fullName || "Chưa đặt tên"}
          </p>
          <p className="truncate text-xs text-gray-500">
            {user?.email || "Người dùng"}
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="mt-2 flex-1">
        <div className="bg-gray-100 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500">
          Tài khoản của tôi
        </div>

        <nav className="mt-1 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 border-l-4 px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Orders */}
        <div className="mt-4 bg-gray-100 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500">
          Đơn hàng của tôi
        </div>

        <nav className="mt-1">
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex items-center gap-3 border-l-4 px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <FileText size={18} />
            <span>Lịch sử đơn hàng</span>
          </NavLink>
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
