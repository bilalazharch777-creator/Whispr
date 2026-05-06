import { useState } from "react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { loginMutation, isPending, error } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("login data", loginData);
    loginMutation(loginData);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-100 p-4 transition-colors duration-300">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0a8dff]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0a8dff]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex w-full max-w-6xl min-h-[85vh] lg:min-h-[70vh] overflow-hidden rounded-3xl shadow-2xl bg-base-100 border border-base-300/50">
        {/* Left Form Section */}
        <div className="w-full lg:w-[45%] p-6 md:p-10 lg:p-14 flex flex-col justify-center">
          <div className="space-y-8 w-full max-w-md mx-auto">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <img src="/logo.png" alt="logo" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#0a8dff] to-[#0a8dff]">
                  WHISPRR
                </h1>
              </div>
              <p className="text-center lg:text-left text-sm font-semibold text-base-content/60 uppercase tracking-[0.3em]">
                Welcome Back
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-shake">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <span className="text-red-400 dark:text-red-300 text-sm font-medium">
                    {error.response?.data?.message || "Invalid credentials"}
                  </span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-base-content">
                  <Mail className="w-4 h-4 text-base-content/60" />
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    placeholder="Enter your email address"
                    className="w-full p-4 pl-12 rounded-xl bg-base-200 border border-base-300 focus:border-[#0a8dff] focus:ring-2 focus:ring-[#0a8dff]/20 outline-none transition-all duration-300 text-base-content placeholder:text-base-content/40 hover:border-base-content/30"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-[#0a8dff] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-base-content">
                    <Lock className="w-4 h-4 text-base-content/60" />
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#0a8dff] hover:text-[#0a8dff]/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    className="w-full p-4 pl-12 pr-12 rounded-xl bg-base-200 border border-base-300 focus:border-[#0a8dff] focus:ring-2 focus:ring-[#0a8dff]/20 outline-none transition-all duration-300 text-base-content placeholder:text-base-content/40 hover:border-base-content/30"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-[#0a8dff] transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isPending}
                className="relative w-full group mt-2"
              >
                <div className="relative overflow-hidden rounded-xl bg-[#0a8dff] hover:bg-[#0a8dff]/90 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[#0a8dff]/25 hover:shadow-[#0a8dff]/40">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                  <div className="relative z-10 p-4 flex items-center justify-center gap-3">
                    {isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-white font-semibold">
                          Signing In...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-white font-semibold">
                          Sign In
                        </span>
                        <LogIn className="text-white" />
                      </>
                    )}
                  </div>
                </div>
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-base-100 text-base-content/60 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="group w-full p-4 rounded-xl border border-base-300 bg-base-200 hover:bg-base-300 transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-6 h-6 relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-6 h-6"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
              </div>
              <span className="text-base-content font-medium">
                Continue with Google
              </span>
            </button>

            {/* Footer Links */}
            <div className="space-y-4 pt-4">
              <p className="text-center text-base-content/70">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#0a8dff] hover:text-[#0a8dff]/80 font-semibold transition-colors hover:underline"
                >
                  Sign up here
                </Link>
              </p>

              <p className="text-xs text-center text-base-content/60">
                By signing in, you agree to our{" "}
                <a
                  href="#"
                  className="text-[#0a8dff] hover:text-[#0a8dff]/80 transition-colors underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-[#0a8dff] hover:text-[#0a8dff]/80 transition-colors underline"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Branding Section */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden p-12 flex-col justify-center items-center bg-gradient-to-br from-base-200 via-base-100 to-base-200">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-[#0a8dff]/20 to-[#0a8dff]/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tr from-[#0a8dff]/20 to-[#0a8dff]/10 rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10 max-w-2xl text-center space-y-8">
            {/* Larger Image - Same as Signup */}
            <div className="relative">
              <div className="w-96 h-96 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a8dff]/10 to-[#0a8dff]/5 rounded-3xl blur-xl"></div>
                <img
                  src="/Mobile-life-cuate.png"
                  className="relative w-full h-full object-contain animate-float"
                  alt="Connecting people worldwide"
                  style={{ transform: "scale(1.2)" }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-[#0a8dff]">
                Welcome Back to WHISPRR
              </h2>
              <p className="text-lg text-base-content/80 leading-relaxed">
                Continue your journey with millions worldwide. Reconnect with
                friends, share stories, and create unforgettable moments
                together.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-base-100/80 backdrop-blur-sm border border-base-300 shadow-sm">
                <div className="text-2xl font-bold text-[#0a8dff]">10M+</div>
                <div className="text-xs text-base-content/70 font-medium">
                  Active Users
                </div>
              </div>
              <div className="p-4 rounded-xl bg-base-100/80 backdrop-blur-sm border border-base-300 shadow-sm">
                <div className="text-2xl font-bold text-[#0a8dff]">150+</div>
                <div className="text-xs text-base-content/70 font-medium">
                  Countries
                </div>
              </div>
              <div className="p-4 rounded-xl bg-base-100/80 backdrop-blur-sm border border-base-300 shadow-sm">
                <div className="text-2xl font-bold text-[#0a8dff]">24/7</div>
                <div className="text-xs text-base-content/70 font-medium">
                  Support
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-100/80 backdrop-blur-sm border border-base-300 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-base-content font-medium">
                  Secure & encrypted connections
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1.2);
          }
          50% {
            transform: translateY(-15px) scale(1.2);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
