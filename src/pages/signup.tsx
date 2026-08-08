import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, CheckCircle2, Mail, Lock, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-dot-grid p-4">
        {/* Decorative gradient orb */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/[0.02] to-accent/[0.02] blur-3xl pointer-events-none" />

        <Card className="glass-darker border-none w-full max-w-md hover:shadow-glass-lg transition-shadow duration-300">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 animate-scale-in">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground mb-2">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              We&apos;ve sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Click the link to activate your account.
            </p>
            <Button onClick={() => navigate("/login")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-dot-grid p-4">
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/[0.02] to-accent/[0.02] blur-3xl pointer-events-none" />

      <div className="glass-darker rounded-xl p-8 w-full max-w-md hover:shadow-glass-lg transition-shadow duration-300 relative">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-on-primary font-bold text-xl shadow-lg shadow-primary/20 animate-float">
            KF
          </div>
          <div className="text-center">
            <h1 className="font-heading text-xl font-bold text-foreground">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Start exploring your documents with AI
            </p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-white/90 focus:ring-2 focus:ring-primary/20 border-border/60 transition-all duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 bg-white/90 focus:ring-2 focus:ring-primary/20 border-border/60 transition-all duration-150"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              At least 6 characters
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive animate-scale-in">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 hover:shadow-lg hover:shadow-primary/20 transition-all duration-150">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary font-medium hover:underline underline-offset-2 cursor-pointer transition-all duration-150"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}