
import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import { http } from "../utils/axios-config";

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLoggedIn = Boolean(accessToken && user);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await http.post("/auth/logout");
    } catch {
      // End local session even if server logout fails.
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="shop-orange text-white">
      <div className="container mx-auto px-3 sm:px-4">

        {/* Top navigation - Desktop */}
        <div className="hidden md:flex justify-between items-center py-2 text-xs">
          <div className="flex items-center gap-4">
            <NavLink to="#">Download</NavLink>
            <span className="opacity-30">|</span>
            <div className="flex items-center gap-2">
              <span>Follow us on</span>
              <i className="fab fa-facebook" />
              <i className="fab fa-instagram" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NavLink to="#">
              <i className="far fa-bell mr-1" />
              Notifications
            </NavLink>

            <NavLink to="#">
              <i className="far fa-question-circle mr-1" />
              Help
            </NavLink>

            <span>
              <i className="fas fa-globe mr-1" />
              English
            </span>

            {isLoggedIn ? (
              <>
                <span className="font-bold truncate max-w-36">
                  <i className="far fa-user mr-1" />
                  {user?.fullName}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="font-bold hover:opacity-80"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/register" className="font-bold">
                  Sign Up
                </NavLink>
                <NavLink to="/login" className="font-bold">
                  Login
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex flex-wrap items-center gap-3 py-3 sm:py-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
          >
            <i className="fas fa-shopping-bag text-2xl sm:text-3xl lg:text-4xl" />
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              Shop
            </span>
          </Link>

          {/* Search */}
          <div className="order-3 sm:order-none w-full sm:flex-1 min-w-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem(
                  "keyword"
                ) as HTMLInputElement;
                navigate(`/products?keyword=${encodeURIComponent(input.value)}`);
              }}
              className="bg-white p-1 rounded-md flex items-center shadow-sm"
            >
              <input
                name="keyword"
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 min-w-0 px-3 py-2 text-black outline-none text-xs sm:text-sm"
              />

              <button
                type="submit"
                aria-label="Search"
                className="shop-orange px-4 sm:px-6 py-2 rounded-sm"
              >
                <i className="fas fa-search" />
              </button>
            </form>
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Giỏ hàng"
            className="ml-auto sm:ml-0 px-2 sm:px-4"
          >
            <i className="fas fa-shopping-cart text-xl sm:text-2xl" />
          </Link>
        </div>

        {/* Mobile account navigation */}
        <div className="md:hidden flex items-center justify-between pb-3 text-xs">
          {isLoggedIn ? (
            <>
              <span className="truncate max-w-[60%]">
                <i className="far fa-user mr-1" />
                {user?.fullName}
              </span>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="font-bold"
              >
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <NavLink to="/register">Đăng ký</NavLink>
              <NavLink to="/login">Đăng nhập</NavLink>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
