import { Check } from "lucide-react";
import { Link } from "react-router-dom";

interface PasswordResetProps {
  onConfirm?: () => void;
}

export default function PasswordReset({ onConfirm }: PasswordResetProps) {
  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-[440px] mx-auto">
        {/* Success Icon */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-50 flex items-center justify-center">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#F15A24] flex items-center justify-center shadow-sm">
              <Check
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                strokeWidth={3}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center gap-5 sm:gap-6">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-[28px] lg:text-3xl font-bold text-[#1a1a1a] leading-tight">
              Password reset
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#9a9a9a] leading-relaxed max-w-md mx-auto">
              Your password has been successfully reset. Click confirm to continue.
            </p>
          </div>

          {/* Confirm Button */}
          {onConfirm ? (
            <button
              type="button"
              onClick={onConfirm}
              className="
                w-full
                bg-[#F15A24]
                hover:bg-[#D94A1B]
                active:scale-[0.98]
                text-white
                py-3.5 sm:py-4
                px-6
                rounded-xl sm:rounded-[18px]
                text-base sm:text-lg
                font-semibold
                shadow-md shadow-orange-500/20
                transition-all duration-200 ease-in-out
                focus:outline-none
                focus-visible:ring-4
                focus-visible:ring-orange-200
                cursor-pointer
              "
            >
              Confirm
            </button>
          ) : (
            <Link
              to="/login"
              className="
                w-full
                bg-[#F15A24]
                hover:bg-[#D94A1B]
                active:scale-[0.98]
                text-white
                text-center
                py-3.5 sm:py-4
                px-6
                rounded-xl sm:rounded-[18px]
                text-base sm:text-lg
                font-semibold
                shadow-md shadow-orange-500/20
                transition-all duration-200 ease-in-out
                focus:outline-none
                focus-visible:ring-4
                focus-visible:ring-orange-200
                cursor-pointer
              "
            >
              Confirm
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
