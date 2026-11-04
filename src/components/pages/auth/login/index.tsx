
import axios from "axios";
import { useState, type FormEvent } from "react";
import { useAuthStore } from "../../../store/auth-store";
import { http } from "../../../utils/axios-config";
import { Link } from "react-router-dom";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
     <div className="flex flex-col md:flex-row w-full min-h-[600px] bg-white overflow-hidden">

      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 bg-[#F15A24] rounded-tr-[120px] rounded-br-[120px] flex-col items-center justify-center text-white px-12 text-center">

        <h1 className="text-5xl font-bold mb-4">
          Hello, Welcome!
        </h1>

        <p className="text-xl mb-8">
          Don't have an account?
        </p>

        <Link
          to="/register"
          className="border-2 border-white text-white px-12 py-3 rounded-xl text-lg font-medium hover:bg-white hover:text-[#F15A24] transition-colors"
        >
          Registration
        </Link>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8 md:px-24">

        <div className="w-full max-w-md">

          <h2 className="text-4xl font-bold text-center text-[#1e1e1e] mb-12">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Username */}
            <div className="relative">
              <input
                type="text"
                name="username"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="Username"
                required
                className="w-full bg-[#E5E7EB] border-none rounded-lg px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F15A24] text-gray-700 placeholder-gray-500"
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
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-[#E5E7EB] border-none rounded-lg px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F15A24] text-gray-700 placeholder-gray-500"
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <i className="fas fa-lock text-xl"></i>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <a
                href="#"
                className="text-sm font-medium text-gray-600 hover:text-[#F15A24] hover:underline"
              >
                Forgot Password!
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#F15A24] text-white font-semibold py-4 rounded-lg shadow-lg hover:bg-[#D94A1B] transition-all text-lg mt-4"
            >
              Login
            </button>

          </form>

          {/* Social Login */}
          <div className="mt-12 text-center">

            <p className="text-gray-600 mb-6">
              Or login with social platforms
            </p>

            <div className="flex justify-center space-x-6">

              <button
                type="button"
                aria-label="Login with Facebook"
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fab fa-facebook-f text-gray-700 text-xl"></i>
              </button>

              <button
                type="button"
                aria-label="Login with Google"
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fab fa-google text-gray-700 text-xl"></i>
              </button>

              <button
                type="button"
                aria-label="Login with TikTok"
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fab fa-tiktok text-gray-700 text-xl"></i>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile Only - Registration Prompt */}
      <div className="md:hidden mt-8 text-center pb-8">
        <div className="text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#F15A24] font-bold hover:underline"
          >
            Registration
          </Link>
        </div>
      </div>

    </div>

  );
}
