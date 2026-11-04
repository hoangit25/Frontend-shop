
import { useState } from "react";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Registration data:", formData);
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Section - Registration Form */}
      <div className="w-1/2 flex flex-col items-center justify-center px-10">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-10">
            Registration
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 mb-8">
              {/* Username */}
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  className="w-full bg-[#E5E7EB] border-none rounded-lg py-4 px-5 pr-12 focus:ring-2 focus:ring-[#F15A24] outline-none text-gray-700 placeholder-gray-500"
                />

                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="far fa-user text-gray-600 text-xl"></i>
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
                  className="w-full bg-[#E5E7EB] border-none rounded-lg py-4 px-5 pr-12 focus:ring-2 focus:ring-[#F15A24] outline-none text-gray-700 placeholder-gray-500"
                />

                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="far fa-envelope text-gray-600 text-xl"></i>
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
                  className="w-full bg-[#E5E7EB] border-none rounded-lg py-4 px-5 pr-12 focus:ring-2 focus:ring-[#F15A24] outline-none text-gray-700 placeholder-gray-500"
                />

                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-600 text-xl"></i>
                </div>
              </div>
            </div>

            {/* Registration Button */}
            <button
              type="submit"
              className="w-full bg-[#F15A24] hover:bg-[#D94A1B] text-white font-medium py-4 rounded-lg transition-colors mb-8"
            >
              Registration
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
      <div className="w-1/2 bg-[#F15A24] rounded-tl-[150px] rounded-bl-[150px] flex flex-col items-center justify-center text-white px-10">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-6">
            Welcome !
          </h2>

          <p className="text-lg mb-8 opacity-90">
            Don't have an account?
          </p>

          <Link to="/login"
            className="border-2 border-white text-white font-medium py-3 px-16 rounded-full hover:bg-white hover:text-[#F15A24] transition-all"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
