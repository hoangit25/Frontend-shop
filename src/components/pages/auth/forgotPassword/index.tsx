import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../../utils/axios-config";
import axios from "axios";

import EmailVerification from "./verify-code-email";
import SetNewPassword from "./set-new-password";
import PasswordResetSuccess from "./reset-password";

const SESSION_KEY = "forgot_password_session";

type Step = "ENTER_EMAIL" | "VERIFY_OTP" | "SET_NEW_PASSWORD" | "SUCCESS";

interface ForgotPasswordSessionData {
  step: Step;
  email: string;
  resetToken?: string;
}

/**
 * Hàm helper đọc dữ liệu an toàn từ sessionStorage:
 * - Tránh crash màn hình nếu dữ liệu bị lỗi/hỏng cú pháp.
 * - Tự động xóa sạch dữ liệu rác khỏi sessionStorage khi gặp lỗi.
 * - Log cảnh báo phục vụ debug.
 */
function getSavedSession(): ForgotPasswordSessionData | null {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as ForgotPasswordSessionData;
  } catch (error) {
    console.warn(
      "Dữ liệu forgot_password_session không hợp lệ, đang xóa bộ nhớ tạm:",
      error
    );
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Đọc 1 lần duy nhất khi khởi tạo
  const savedSession = getSavedSession();

  const [step, setStep] = useState<Step>(savedSession?.step || "ENTER_EMAIL");
  const [email, setEmail] = useState<string>(savedSession?.email || "");
  const [resetToken, setResetToken] = useState<string>(
    savedSession?.resetToken || ""
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Đồng bộ state vào sessionStorage mỗi khi step, email, resetToken thay đổi
  useEffect(() => {
    if (step === "ENTER_EMAIL" && !email) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    if (step === "SUCCESS") {
      // Hoàn tất quy trình -> dọn sạch sessionStorage
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    const sessionData: ForgotPasswordSessionData = {
      step,
      email,
      resetToken,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }, [step, email, resetToken]);

  // ========================================================
  // BƯỚC 1: XỬ LÝ GỬI EMAIL LẤY MÃ OTP
  // ========================================================
  const handleSendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await http.post("/auth/forgot-password", {
        email: email.trim(),
      });

      // Chuyển sang bước nhập mã OTP
      setStep("VERIFY_OTP");
    } catch (err: unknown) {
      const msg = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setError(msg || "Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // BƯỚC 2: XỬ LÝ XÁC THỰC MÃ OTP
  // ========================================================
  const handleVerifyOtp = async (otpCode: string) => {
    try {
      const res = await http.post<{ data: { resetToken: string } }>(
        "/auth/verify-otp",
        {
          email: email.trim(),
          otp: otpCode,
        }
      );

      const token = res.data?.data?.resetToken;
      setResetToken(token);
      // Chuyển sang bước tạo mật khẩu mới
      setStep("SET_NEW_PASSWORD");
    } catch (err: unknown) {
      const msg = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      throw new Error(msg || "Mã xác thực không hợp lệ hoặc đã hết hạn.");
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    try {
      await http.post("/auth/forgot-password", {
        email: email.trim(),
      });
    } catch (err: unknown) {
      const msg = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      alert(msg || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    }
  };

  // ========================================================
  // RENDER THEO TỪNG BƯỚC (F5 GIỮ NGUYÊN BƯỚC ĐANG ĐỨNG)
  // ========================================================

  // Bước 2: Nhập OTP
  if (step === "VERIFY_OTP") {
    return (
      <EmailVerification
        email={email}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onBack={() => setStep("ENTER_EMAIL")}
      />
    );
  }

  // Bước 3: Đặt mật khẩu mới
  if (step === "SET_NEW_PASSWORD") {
    return (
      <SetNewPassword
        email={email}
        resetToken={resetToken}
        onSuccess={() => setStep("SUCCESS")}
      />
    );
  }

  // Bước 4: Màn hình thông báo thành công
  if (step === "SUCCESS") {
    return (
      <PasswordResetSuccess
        onConfirm={() => {
          sessionStorage.removeItem(SESSION_KEY);
          navigate("/login");
        }}
      />
    );
  }

  // Bước 1: Nhập email (Mặc định)
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="space-y-3 mb-8">
          <h1 className="text-3xl sm:text-[32px] font-bold text-[#1a1a1a] leading-tight">
            Forgot password
          </h1>

          <p className="text-base sm:text-lg text-[#8c8c8c] leading-relaxed">
            Please enter your email to reset the password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSendEmail} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-base sm:text-lg font-semibold text-[#1a1a1a]"
            >
              Your Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              autoComplete="email"
              className={`w-full px-5 py-4 text-base sm:text-lg border-[1.5px] rounded-xl sm:rounded-2xl outline-none transition-all placeholder:text-[#b4b4b4]
                ${
                  error
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#e2e8f0] focus:border-[#F15A24] focus:ring-2 focus:ring-[#F15A24]/10"
                }`}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#F15A24] hover:bg-[#D94A1B] active:scale-[0.99] text-white font-bold text-base sm:text-lg py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all shadow-md shadow-orange-500/20 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600 hover:text-[#F15A24] transition-colors"
          >
            <span aria-hidden="true">←</span>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
