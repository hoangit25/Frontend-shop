
import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/auth-store";
import { http } from "../../../utils/axios-config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await http.post<{
        data: {
          accessToken: string;
          user: { fullName?: string; email?: string };
        };
      }>("/auth/login", {
        email: email.trim(),
        password,
      });

      const loggedInUser = response.data.data.user;
      const userEmail = loggedInUser.email?.trim() || email.trim();
      const user = {
        fullName: loggedInUser.fullName?.trim() || userEmail,
        email: userEmail,
      };

      setAccessToken(response.data.data.accessToken);
      setUser(user);
      localStorage.setItem("is_login", "true");
      navigate("/", { replace: true });
    } catch (error) {
      const errorMessage = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data.message
        : undefined;

      setMessage(
        errorMessage || "Đăng nhập thất bại. Vui lòng thử lại."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-3 sm:p-6 lg:p-8">

      {/* Main Container */}
      <div className="w-full max-w-[1440px] min-h-[600px] lg:min-h-[700px] bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row">

        {/* Left Panel */}
        <section className="hidden md:flex md:w-1/2 lg:w-[45%] xl:w-[45%] bg-[#F15A24] rounded-r-[80px] lg:rounded-r-[120px] flex-col items-center justify-center text-white text-center px-8 lg:px-12 xl:px-16">
          <div className="max-w-lg">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
              Hello, Welcome!
            </h1>

            <p className="text-lg lg:text-xl mb-8">
              Don't have an account?
            </p>

            <Link
              to="/register"
              className="inline-flex items-center justify-center border-2 border-white text-white px-10 lg:px-12 py-3 rounded-xl text-base lg:text-lg font-medium hover:bg-white hover:text-[#F15A24] transition-colors"
            >
              Registration
            </Link>
          </div>
        </section>

        {/* Right Panel */}
        <section className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-10 md:px-8 lg:px-12 xl:px-16 2xl:px-20">

          <div className="w-full max-w-[440px]">

            <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#1e1e1e] mb-10 lg:mb-12">
              Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full bg-[#E5E7EB] border-none rounded-lg px-5 sm:px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F15A24] text-gray-700 placeholder-gray-500"
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <i className="far fa-user text-xl"></i>
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-[#E5E7EB] border-none rounded-lg px-5 sm:px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F15A24] text-gray-700 placeholder-gray-500"
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <i className="fas fa-lock text-xl"></i>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-gray-600 hover:text-[#F15A24] hover:underline"
                >
                  Forgot Password!
                </Link>
              </div>

              {/* Message */}
              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-center text-sm text-gray-600"
                >
                  {message}
                </p>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#F15A24] text-white font-semibold py-4 rounded-lg shadow-lg hover:bg-[#D94A1B] transition-all text-base sm:text-lg mt-4 disabled:opacity-70"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

            </form>

            {/* Social Login */}
            <div className="mt-10 lg:mt-12 text-center">

              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Or login with social platforms
              </p>

              <div className="flex justify-center gap-4 sm:gap-6">

                <button
                  type="button"
                  aria-label="Login with Facebook"
                  className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fab fa-facebook-f text-gray-700 text-xl"></i>
                </button>

                <button
                  type="button"
                  aria-label="Login with Google"
                  className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fab fa-google text-gray-700 text-xl"></i>
                </button>

                <button
                  type="button"
                  aria-label="Login with TikTok"
                  className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fab fa-tiktok text-gray-700 text-xl"></i>
                </button>

              </div>
            </div>
          </div>
        </section>

        {/* Mobile Registration */}
        <div className="md:hidden text-center pb-8 px-4">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#F15A24] font-bold hover:underline"
            >
              Registration
            </Link>
          </p>
        </div>

      </div>
    </main>

  );
}
