import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !loading) {
      setRedirecting(true);
      // Small delay so the auth UI can finish its transition
      const timer = setTimeout(() => navigate("/dashboard", { replace: true }), 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  // Intercept the "Don't have an account? Sign up" link so it navigates to
  // the signup page instead of toggling the view in place.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest?.('a[href="#auth-sign-up"]');
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
      navigate("/signup");
    };
    card.addEventListener("click", onClick);
    return () => card.removeEventListener("click", onClick);
  }, [navigate]);

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary font-bold text-xl mb-4">
            KF
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            KnowFlow AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your AI workplace assistant for instant company knowledge.
          </p>
        </div>

        {/* Auth form */}
        <div ref={cardRef} className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "oklch(0.3462 0.0736 256.04)",
                    brandAccent: "oklch(0.4 0.09 256.04)",
                    brandButtonText: "white",
                    defaultButtonBackground: "white",
                    defaultButtonBackgroundHover: "oklch(0.9632 0.0034 247.86)",
                    inputBackground: "white",
                    inputBorder: "oklch(0.9268 0.0063 255.48)",
                    inputBorderHover: "oklch(0.3462 0.0736 256.04)",
                    inputBorderFocus: "oklch(0.3462 0.0736 256.04)",
                  },
                  space: {
                    buttonPadding: "10px 16px",
                    inputPadding: "10px 16px",
                  },
                  radii: {
                    borderRadiusButton: "8px",
                    buttonBorderRadius: "8px",
                    inputBorderRadius: "8px",
                  },
                },
              },
              style: {
                button: {
                  fontWeight: "600",
                  fontSize: "14px",
                  height: "40px",
                },
                input: {
                  fontSize: "14px",
                },
                label: {
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "oklch(0.2077 0.0398 265.75)",
                },
                divider: {
                  background: "oklch(0.9268 0.0063 255.48)",
                },
                message: {
                  fontSize: "13px",
                  borderRadius: "8px",
                  padding: "8px 12px",
                },
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
}