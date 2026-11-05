
import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");

    console.log("Reset password email:", email);
  };

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
        <form onSubmit={handleSubmit} className="space-y-6">

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

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#F15A24] hover:bg-[#D94A1B] active:scale-[0.99] text-white font-bold text-base sm:text-lg py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all shadow-md shadow-orange-500/20"
          >
            Reset Password
          </button>

        </form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600 hover:text-[#F15A24] transition-colors"
          >
            <span aria-hidden="true">←</span>
            Back to Login
          </a>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
