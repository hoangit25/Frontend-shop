
import axios from "axios";
import { useState, type FormEvent } from "react";
import { useAuthStore } from "../../../store/auth-store";
import { http } from "../../../utils/axios-config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setMessage("");

    try {
      const response = await http.post<{ data: { accessToken: string } }>(
        "/auth/login",
        { email: email.trim(), password }
      );

      setAccessToken(response.data.data.accessToken);
      localStorage.setItem('is_login',`true`)
      setMessage("Đăng nhập thành công.");
    } catch (error) {
      const errorMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data.message
        : undefined;

      setMessage(errorMessage || "Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-4 py-8 font-sans">
      <section className="w-full max-w-[400px] rounded-lg border border-gray-200 bg-white px-6 py-9 shadow-[0_8px_28px_rgba(0,0,0,0.06)] sm:px-8">
        {/* Logo demo */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8323b] text-2xl font-bold text-white">
            A
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-[#222222]">
          Account Login
        </h1>

        <p className="mb-7 mt-2 text-center text-sm text-gray-500">
          Đăng nhập vào tài khoản của bạn
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email
            </label>

            <input
              id="username"
              type="text"
              autoComplete="off"
              placeholder="Nhập email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none transition focus:border-[#e8323b] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Mật khẩu
            </label>

            <div className="flex h-11 items-center rounded-md border border-gray-300 pr-3 transition focus-within:border-[#e8323b] focus-within:ring-2 focus-within:ring-red-100">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-full min-w-0 flex-1 rounded-md bg-transparent px-3 text-sm outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="shrink-0 text-xs text-gray-500 hover:text-gray-800"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-3 h-11 w-full rounded-md bg-[#e8323b] text-sm font-semibold text-white transition hover:bg-[#cc252e] active:scale-[0.99]"
          >
            Đăng nhập
          </button>

          {message && (
            <p
              role="status"
              className="rounded-md bg-red-50 p-3 text-sm leading-5 text-red-700"
            >
              {message}
            </p>
          )}
        </form>

        {/* Links */}
        <div className="mt-5 flex items-center justify-between gap-3 text-xs">
          <a
            href="#register"
            className="text-gray-600 transition hover:text-[#e8323b]"
          >
            Tạo tài khoản mới
          </a>

          <a
            href="#help"
            className="text-gray-600 transition hover:text-[#e8323b]"
          >
            Trợ giúp
          </a>
        </div>

        <div className="mt-7 border-t border-gray-100 pt-4 text-center">
          <p className="text-[10px] font-medium tracking-wide text-red-600">
            KẾT NỐI HỆ THỐNG XÁC THỰC
          </p>
        </div>
      </section>
    </main>
  );
}
