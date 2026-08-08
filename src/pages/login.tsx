import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => navigate("/dashboard", { replace: true }), 300);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password. Try again."
          : authError.message
      );
      setSubmitting(false);
    }
  };

  if (user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-on-primary font-bold text-lg">
            KF
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Redirecting to dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-on-primary font-bold text-lg mb-4">
            KF
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sign in to your KnowFlow AI workspace
          </p>
        </div>

        {/* Auth form */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="login-email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
              className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-150"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-150"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary underline-offset-2 hover:underline transition-all"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}