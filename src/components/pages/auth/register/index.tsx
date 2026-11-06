import axios from "axios";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../../utils/axios-config";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa thông báo lỗi khi người dùng bắt đầu gõ lại
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const { fullName, email, password } = formData;

    // 1. Kiểm tra validation cơ bản phía client
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (fullName.trim().length < 2) {
      setErrorMessage("Họ và tên phải có ít nhất 2 ký tự.");
      return;
    }

    // Backend regex: ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt, độ dài 6-20 ký tự
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "Mật khẩu phải từ 6-20 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Gọi API đăng ký user mới bên backend
      await http.post("/auth/register", {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSuccessMessage("Đăng ký tài khoản thành công! Đang chuyển sang trang đăng nhập...");

      // 3. Chuyển hướng sang trang Login sau 1.5 giây
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setErrorMessage(apiMessage || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Section - Registration Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-8">
            Registration
          </h1>

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2 animate-shake">
              <i className="fas fa-exclamation-circle text-base mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Thông báo thành công */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
              <i className="fas fa-check-circle text-base mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 mb-6">
              {/* Full Name */}
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name (Họ và tên)"
                  required
                  disabled={isSubmitting}
                  className="w-full bg-[#E5E7EB] border-none rounded-lg py-3.5 px-5 pr-12 focus:ring-2 focus:ring-[#F15A24] outline-none text-gray-700 placeholder-gray-500 disabled:opacity-60"
                />

                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="far fa-user text-gray-600 text-lg"></i>
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  disabled={isSubmitting}
                  className="w-full bg-[#E5E7EB] border-none rounded-lg py-3.5 px-5 pr-12 focus:ring-2 focus:ring-[#F15A24] outline-none text-gray-700 placeholder-gray-500 disabled:opacity-60"
                />

                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="far fa-envelope text-gray-600 text-lg"></i>
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  disabled={isSubmitting}
                  className="w-full bg-[#E5E7EB] border-none rounded-lg py-3.5 px-5 pr-12 focus:ring-2 focus:ring-[#F15A24] outline-none text-gray-700 placeholder-gray-500 disabled:opacity-60"
                />

                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-600 text-lg"></i>
                </div>
              </div>

              {/* Gợi ý mật khẩu */}
              <p className="text-[11px] text-gray-500 leading-relaxed">
                * Mật khẩu tối thiểu 6 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&).
              </p>
            </div>

            {/* Registration Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F15A24] hover:bg-[#D94A1B] text-white font-medium py-3.5 rounded-lg transition-colors mb-6 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Đang đăng ký...
                </>
              ) : (
                "Registration"
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-4">
              Or login with social platforms
            </p>

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                aria-label="Login with Facebook"
                className="w-10 h-10 border border-gray-400 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <i className="fab fa-facebook-f text-gray-700"></i>
              </button>

              <button
                type="button"
                aria-label="Login with Google"
                className="w-10 h-10 border border-gray-400 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <i className="fab fa-google text-gray-700"></i>
              </button>

              <button
                type="button"
                aria-label="Login with TikTok"
                className="w-10 h-10 border border-gray-400 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <i className="fab fa-tiktok text-gray-700"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Welcome Message */}
      <div className="hidden md:flex md:w-1/2 bg-[#F15A24] rounded-tl-[150px] rounded-bl-[150px] flex-col items-center justify-center text-white px-10">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-6">
            Welcome !
          </h2>

          <p className="text-lg mb-8 opacity-90">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="border-2 border-white text-white font-medium py-3 px-16 rounded-full hover:bg-white hover:text-[#F15A24] transition-all inline-block"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
