import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, Card, Input, Logo, notify, PasswordInput, Select } from "@uc/ui";
import { Context, api } from "@uc/client";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(
        "/user/login",
        { email, password, role },
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
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="flex flex-col items-center text-center">
            <Logo size="lg" />
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-fg">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-fg-subtle">
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

            <Select
              label="Signing in as"
              options={["Admin", "Doctor"]}
              value={role}
              onValueChange={setRole}
              hint="Doctors see their own schedule; admins see the whole desk."
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
        </Card>

        <p className="mt-6 text-center text-xs text-fg-subtle">
          Patients should book appointments on the main website.
        </p>
      </div>
    </div>
  );
};

export default Login;
