
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
      localStorage.setItem('is_login', `true`)
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
      <section className="w-full max-w-[400px] rounded-xl border border-gray-200 bg-white px-6 py-9 shadow-[0_8px_28px_rgba(0,0,0,0.06)] sm:px-8">

        {/* Logo */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e8323b] text-2xl font-bold text-white shadow-md">
            A
          </div>
        </div>
        <div className="mb-7 mt-2 text-center font-bold text-gray-500">
          Đăng nhập vào tài khoản của bạn
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-left font-semibold text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#e8323b] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-left font-semibold text-gray-700"
            >
              Mật khẩu
            </label>

            <div className="flex h-11 items-center rounded-lg border border-gray-300 transition focus-within:border-[#e8323b] focus-within:ring-2 focus-within:ring-red-100">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-full min-w-0 flex-1 rounded-lg bg-transparent px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="mr-3 shrink-0 text-xs font-medium text-gray-500 transition hover:text-[#e8323b]"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 h-11 w-full rounded-lg bg-[#e8323b] text-sm font-semibold text-white shadow-sm transition hover:bg-[#cc252e] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2"
          >
            Đăng nhập
          </button>

          {/* Message */}
          {message && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700"
            >
              {message}
            </p>
          )}
        </form>

        {/* Links */}
        <div className="mt-6 flex items-center justify-between gap-3 text-xs">
          <a
            href="#register"
            className="font-medium text-gray-600 transition hover:text-[#e8323b]"
          >
            Tạo tài khoản mới
          </a>

          <a
            href="#help"
            className="font-medium text-gray-600 transition hover:text-[#e8323b]"
          >
            Trợ giúp?
          </a>
        </div>

        {/* Footer */}
        <div className="mt-7 border-t border-gray-100 pt-5 text-center">
          <p className="text-[10px] font-semibold tracking-[1.5px] text-red-600">
            KẾT NỐI HỆ THỐNG XÁC THỰC
          </p>
        </div>

      </section>
    </main>

  );
}
