import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { http } from "../../../utils/axios-config";
import axios from "axios";

interface PasswordResetFormProps {
  email: string;
  resetToken: string;
  onSuccess: () => void;
  onSubmit?: (password: string) => void | Promise<void>;
}

export default function PasswordResetForm({
  email,
  resetToken,
  onSuccess,
  onSubmit,
}: PasswordResetFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate theo chuẩn Backend (tối thiểu 6 ký tự, gồm hoa, thường, số, ký tự đặc biệt)
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
  const isPasswordValid = password.length >= 6 && regex.test(password);

  const isPasswordMatched =
    password === confirmPassword && confirmPassword.length > 0;

  const isFormValid = isPasswordValid && isPasswordMatched;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Mật khẩu phải từ 6 ký tự trở lên.");
      return;
    }

    if (!regex.test(password)) {
      setError(
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Nếu có onSubmit custom thì gọi
      if (onSubmit) {
        await onSubmit(password);
      } else {
        // Mặc định gọi API reset-password backend
        await http.post("/auth/reset-password", {
          email,
          resetToken,
          password,
        });
      }

      onSuccess();
    } catch (err: unknown) {
      const msg = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setError(msg || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-[460px] mx-auto">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-50 flex items-center justify-center">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#F15A24] flex items-center justify-center shadow-sm">
              <LockKeyhole
                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10 space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-[28px] lg:text-3xl font-bold text-[#1a1a1a] tracking-tight">
            Create new password
          </h1>

          <p className="text-sm sm:text-base text-[#8c8c8c] leading-relaxed max-w-sm mx-auto">
            Your new password must be different from previous passwords.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm sm:text-base font-semibold text-[#1a1a1a] mb-2"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                required
                className="
                  w-full
                  px-4 sm:px-5
                  py-3.5 sm:py-4
                  pr-12
                  border border-gray-200
                  rounded-xl sm:rounded-[16px]
                  text-sm sm:text-base
                  text-gray-900
                  placeholder:text-gray-400
                  outline-none
                  transition-all duration-200
                  focus:border-[#F15A24]
                  focus:ring-2 focus:ring-[#F15A24]/10
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  text-gray-400 hover:text-[#F15A24]
                  transition-colors cursor-pointer
                "
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Must be at least 6 characters, including uppercase, lowercase, numbers, and symbols.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm sm:text-base font-semibold text-[#1a1a1a] mb-2"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
                className="
                  w-full
                  px-4 sm:px-5
                  py-3.5 sm:py-4
                  pr-12
                  border border-gray-200
                  rounded-xl sm:rounded-[16px]
                  text-sm sm:text-base
                  text-gray-900
                  placeholder:text-gray-400
                  outline-none
                  transition-all duration-200
                  focus:border-[#F15A24]
                  focus:ring-2 focus:ring-[#F15A24]/10
                "
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  text-gray-400 hover:text-[#F15A24]
                  transition-colors cursor-pointer
                "
              >
                {showConfirmPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <p
                className={`text-xs mt-2 ${
                  isPasswordMatched ? "text-green-600" : "text-red-500"
                }`}
              >
                {isPasswordMatched
                  ? "Passwords match."
                  : "Passwords do not match."}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p
              role="alert"
              className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
            >
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`
              w-full
              py-3.5 sm:py-4
              px-6
              rounded-xl sm:rounded-[16px]
              text-base sm:text-lg
              font-bold
              text-white
              transition-all duration-200
              ${
                isFormValid && !isSubmitting
                  ? "bg-[#F15A24] hover:bg-[#D94A1B] active:scale-[0.99] shadow-md shadow-orange-500/20 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
