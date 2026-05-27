import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../context/AppContext";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { api } from "../lib/api";

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm transition " +
  "focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  useEffect(() => {
    document.title = "Sign In · Care Medical Institute";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(
        "/user/login",
        { email, password, role: "Patient" },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success(data.message);
      setEmail("");
      setPassword("");
      setIsAuthenticated(true);
      navigateTo("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not reach the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to book appointments and view your details.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={fieldClass}
                type="email"
                autoComplete="username"
                placeholder="ananya.sharma@example.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className={`${fieldClass} pr-11`}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3.5
                    text-slate-400 transition hover:text-slate-600 focus:outline-none
                    focus-visible:ring-2 focus-visible:ring-teal-600/30"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white
                shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2
                focus-visible:ring-teal-600 focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Not registered yet?{" "}
            <Link
              to="/register"
              className="font-semibold text-teal-700 transition hover:text-teal-800"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
