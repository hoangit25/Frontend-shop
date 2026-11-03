import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="shopee-orange text-white text-xs">
      <div className="container mx-auto px-4">
        <div className="flex justify-between py-2">
          <div className="flex gap-4">
            <NavLink to="#" className="hover:opacity-80">
              Download
            </NavLink>

            <div className="border-l border-white opacity-30" />

            <div className="flex items-center gap-2">
              <span>Follow us on</span>
              <i className="fab fa-facebook" />
              <i className="fab fa-instagram" />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <NavLink
              to="#"
              className="flex items-center gap-1 hover:opacity-80"
            >
              <i className="far fa-bell text-sm" />
              Notifications
            </NavLink>

            <NavLink
              to="#"
              className="flex items-center gap-1 hover:opacity-80"
            >
              <i className="far fa-question-circle text-sm" />
              Help
            </NavLink>

            <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
              <i className="fas fa-globe text-sm" />
              English
              <i className="fas fa-chevron-down text-[10px]" />
            </div>

            <NavLink to="#" className="font-bold hover:opacity-80">
              Sign Up
            </NavLink>

            <div className="border-l border-white opacity-30 h-3" />

            <NavLink to="/login" className="font-bold hover:opacity-80">
              Login
            </NavLink>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 pb-6">
          <div className="flex items-center gap-2 flex-shrink-0 mr-8 cursor-pointer">
            <i className="fas fa-shopping-bag text-4xl" />
            <span className="text-3xl font-bold tracking-tighter">
              Shop
            </span>
          </div>

          <div className="flex-grow max-w-4xl">
            <div className="bg-white p-1 rounded-sm flex items-center shadow-sm">
              <input
                type="text"
                placeholder="Shopee bao ship 0Đ - Đăng ký ngay!"
                className="flex-grow px-4 py-2 text-black outline-none text-sm"
              />

              <button
                type="button"
                aria-label="Search"
                className="shopee-orange px-6 py-2 rounded-sm"
              >
                <i className="fas fa-search" />
              </button>
            </div>
          </div>

          <div className="px-10 relative cursor-pointer">
            <i className="fas fa-shopping-cart text-2xl" />
          </div>
        </div>
      </div>
    </header>
  );
}
