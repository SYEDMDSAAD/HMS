import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button, Card, Input, notify, PasswordInput } from "@uc/ui";
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
      notify.success(data.message);
      setEmail("");
      setPassword("");
      setIsAuthenticated(true);
      navigateTo("/");
    } catch (error) {
      notify.apiError(error, "Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="bg-surface-muted px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <Card className="sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-fg-subtle">
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

            <Button
              type="submit"
              fullWidth
              loading={submitting}
              loadingText="Signing in…"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-fg-muted">
            Not registered yet?{" "}
            <Link
              to="/register"
              className="font-semibold text-accent-text transition hover:text-accent-text"
            >
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
