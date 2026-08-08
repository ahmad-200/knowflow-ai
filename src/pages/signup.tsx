import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => navigate("/dashboard", { replace: true }), 300);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
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

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white font-bold text-lg mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight mb-2">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Click it to activate your account.
            </p>
            <Button
              variant="outline"
              className="mt-8"
              onClick={() => navigate("/login")}
            >
              Back to sign in
            </Button>
          </div>
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
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Get started with KnowFlow AI
          </p>
        </div>

        {/* Auth form */}
        <form
          onSubmit={handleSignup}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="signup-email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="signup-email"
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
              htmlFor="signup-password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
              className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-150"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="signup-confirm"
              className="text-sm font-medium text-foreground"
            >
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
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
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline-offset-2 hover:underline transition-all"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}