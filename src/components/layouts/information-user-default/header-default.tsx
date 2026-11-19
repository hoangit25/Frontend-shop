import { Link } from "react-router-dom";
import { Home, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../../store/auth-store";

const Header = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-green-600 px-4 text-white shadow-sm sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold sm:text-lg">
          Tài khoản của tôi
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 sm:text-sm"
        >
          <Home size={16} />
          <span>Về trang chủ</span>
        </Link>

        <div className="flex items-center gap-2.5 border-l border-white/20 pl-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="h-8 w-8 rounded-full border border-white/30 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
              <UserIcon size={16} />
            </div>
          )}
          <span className="hidden text-sm font-medium sm:inline max-w-[140px] truncate">
            {user?.fullName || user?.email || "Người dùng"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
