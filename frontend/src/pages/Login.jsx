import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Input, PasswordInput } from "@uc/ui";
import { Context, api } from "@uc/client";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  useEffect(() => {
    document.title = "Sign In · UC Healthcare";
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
    <div className="bg-ink-50 px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-e1 sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Sign in to book appointments and view your details.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="ananya.sharma@example.in"
              value={email}
              onValueChange={setEmail}
              required
              disabled={submitting}
            />

            <PasswordInput
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onValueChange={setPassword}
              required
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-accent-700 px-6 py-3 text-sm font-semibold text-white
                shadow-e1 transition hover:bg-accent-800 focus:outline-none focus-visible:ring-2
                focus-visible:ring-accent-600 focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600">
            Not registered yet?{" "}
            <Link
              to="/register"
              className="font-semibold text-accent-700 transition hover:text-accent-800"
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
