import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

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
    // On success, the onAuthStateChange listener in AuthProvider handles navigation
  };

  if (user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background bg-dot-grid">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-on-primary font-bold text-xl shadow-lg shadow-primary/20 animate-breathe">
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background bg-dot-grid p-4 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-in relative">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-on-primary font-bold text-xl shadow-lg shadow-primary/20 animate-float mb-5">
            KF
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sign in to your KnowFlow AI workspace
          </p>
        </div>

        {/* Auth form — glass card */}
        <form
          onSubmit={handleLogin}
          className="rounded-xl glass-darker p-6 space-y-5 hover:shadow-glass-lg transition-shadow duration-300"
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
              className="flex h-10 w-full rounded-lg border border-border bg-white/90 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-150"
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
              className="flex h-10 w-full rounded-lg border border-border bg-white/90 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-150"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive animate-slide-up">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 hover:shadow-lg hover:shadow-primary/20 transition-all" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Sign in
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary underline-offset-2 hover:underline hover:gap-1 transition-all"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}