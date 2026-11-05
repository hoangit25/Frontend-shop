import { useEffect, useRef, useState } from "react";

interface EmailVerificationProps {
  email?: string;
  onVerify?: (otp: string) => Promise<void> | void;
  onResend?: () => Promise<void> | void;
  onBack?: () => void;
}

const OTP_LENGTH = 6;
const OTP_EXPIRES_IN = 5 * 60; // 5 phút

export default function EmailVerification({
  email = "",
  onVerify,
  onResend,
  onBack,
}: EmailVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [remainingTime, setRemainingTime] = useState(OTP_EXPIRES_IN);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Đếm ngược thời gian hết hạn OTP
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const isOtpComplete = otp.every((digit) => digit !== "");
  const isVerifyEnabled = isOtpComplete && !isExpired && !loading;

  const handleChange = (value: string, index: number) => {
    if (isExpired) return;
    setErrorMessage("");

    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Tự động focus sang ô tiếp theo
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isExpired) return;
    setErrorMessage("");

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedData) return;

    const newOtp = Array(OTP_LENGTH).fill("");
    pastedData.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    if (!isVerifyEnabled) return;

    const code = otp.join("");
    setLoading(true);
    setErrorMessage("");

    try {
      await onVerify?.(code);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Mã xác thực không hợp lệ hoặc đã hết hạn.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isExpired && remainingTime > 0) return;

    setOtp(Array(OTP_LENGTH).fill(""));
    setRemainingTime(OTP_EXPIRES_IN);
    setIsExpired(false);
    setErrorMessage("");

    inputsRef.current[0]?.focus();
    await onResend?.();
  };

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        {/* Heading */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 mb-3">
            Check your email
          </h1>

          <p className="text-sm sm:text-[15px] text-[#8e8e8e] leading-relaxed break-words">
            We sent a verification code to{" "}
            <span className="font-semibold text-gray-800">{email}</span>
            <br />
            Enter the 6-digit code mentioned in the email.
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              disabled={isExpired}
              aria-label={`OTP digit ${index + 1}`}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="
                w-10 h-12
                sm:w-12 sm:h-14
                md:w-[54px] md:h-[60px]
                border border-gray-200
                rounded-lg sm:rounded-xl
                text-center text-xl sm:text-2xl
                font-semibold text-gray-900
                outline-none
                transition-all duration-200
                focus:border-[#F15A24]
                focus:ring-2 focus:ring-[#F15A24]/10
                disabled:bg-gray-100 disabled:text-gray-400
              "
            />
          ))}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-center text-sm text-red-600 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-sm text-gray-500">
            {isExpired ? "Code expired" : "Code expires in"}
          </span>

          <span
            className={`text-sm font-semibold tabular-nums ${
              isExpired
                ? "text-red-500"
                : remainingTime <= 60
                ? "text-orange-500"
                : "text-[#F15A24]"
            }`}
          >
            {formatTime(remainingTime)}
          </span>
        </div>

        {/* Verify Button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={!isVerifyEnabled}
          className={`
            w-full py-4 rounded-xl
            font-bold text-base sm:text-lg
            transition-all duration-200
            ${
              isVerifyEnabled
                ? "bg-[#F15A24] text-white hover:bg-[#D94A1B] active:scale-[0.99] cursor-pointer shadow-md shadow-orange-500/20"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        {/* Resend Email */}
        <div className="mt-8 text-center text-sm sm:text-[15px] text-[#8e8e8e]">
          <span>Haven't got the email yet? </span>

          <button
            type="button"
            onClick={handleResend}
            disabled={!isExpired}
            className={`
              font-medium underline underline-offset-2
              transition-colors
              ${
                isExpired
                  ? "text-[#F15A24] hover:text-[#D94A1B] cursor-pointer"
                  : "text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Resend email
          </button>
        </div>

        {isExpired && (
          <p className="mt-4 text-center text-sm text-red-500">
            Your verification code has expired. Please request a new code.
          </p>
        )}

        {/* Back option */}
        {onBack && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-[#F15A24] transition-colors"
            >
              ← Thay đổi email khác
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
