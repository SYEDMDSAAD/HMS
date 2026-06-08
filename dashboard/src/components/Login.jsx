import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Input, Logo, PasswordInput } from "@uc/ui";
import { Context, api } from "@uc/client";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(
        "/user/login",
        { email, password, role: "Admin" },
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
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-line bg-white p-8 shadow-e1">
          <div className="flex flex-col items-center text-center">
            <Logo size="lg" />
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              UC Healthcare · staff access only
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="admin@example.in"
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
                shadow-e1 transition hover:bg-accent-800 focus:outline-none focus:ring-2
                focus:ring-accent-600 focus:ring-offset-2 disabled:cursor-not-allowed
                disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          Patients should book appointments on the main website.
        </p>
      </div>
    </div>
  );
};

export default Login;
