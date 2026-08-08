import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa, type ThemeConfig } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";

// Suppress the "forwardRef" React warning from auth-ui-react
function suppressConsoleWarnings() {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.("forwardRef")) return;
    originalWarn.apply(console, args);
  };
}

suppressConsoleWarnings();

const customTheme: ThemeConfig = {
  ...ThemeSupa,
  variables: {
    default: {
      fonts: {
        bodyFontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",
        buttonFontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",
        inputFontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",
        labelFontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",
      },
      colors: {
        brand: "oklch(0.3462 0.0736 256.04)",
        brandAccent: "oklch(0.3 0.07 256)",
        brandButtonText: "white",
        defaultButtonBackground: "white",
        defaultButtonBackgroundHover: "oklch(0.97 0 0)",
        inputBackground: "rgba(255,255,255,0.9)",
        inputBorder: "oklch(0.9268 0.0063 255.48)",
        inputBorderFocus: "oklch(0.3462 0.0736 256.04)",
        inputText: "oklch(0.2077 0.0398 265.75)",
        inputLabelText: "oklch(0.2077 0.0398 265.75)",
        inputPlaceholder: "oklch(0.5561 0.0283 264.36)",
        messageText: "oklch(0.5561 0.0283 264.36)",
        messageTextDanger: "oklch(0.5771 0.2152 27.33)",
        anchorTextColor: "oklch(0.3462 0.0736 256.04)",
        dividerBackground: "oklch(0.9268 0.0063 255.48)",
      },
      borderWidths: {
        buttonBorderWidth: "1px",
        inputBorderWidth: "1px",
      },
      radii: {
        borderRadiusButton: "8px",
        buttonBorderRadius: "8px",
        inputBorderRadius: "8px",
      },
    },
  },
  className: {
    container: "w-full",
    label: "text-sm font-medium",
    input: "bg-white/90 focus:ring-2 focus:ring-primary/20 transition-all duration-150",
    button: "font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-150",
    anchor: "text-primary hover:gap-1 transition-all duration-150",
    divider: "my-4",
    message: "text-sm animate-scale-in",
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authView, setAuthView] = useState<"sign_in" | "sign_up">("sign_in");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleViewChange = () => {
    setAuthView((prev) => (prev === "sign_in" ? "sign_up" : "sign_in"));
  };

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
              KnowFlow AI
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your account
            </p>
          </div>
        </div>

        {/* Auth UI */}
        <Auth
          supabaseClient={supabase}
          view={authView}
          appearance={{ theme: customTheme }}
          providers={[]}
          redirectTo={`${window.location.origin}/dashboard`}
          onlyThirdPartyProviders={false}
          magicLink={false}
          showLinks={false}
        />

        {/* Toggle between sign in / sign up */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {authView === "sign_in" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={handleViewChange}
                  className="text-primary font-medium hover:underline underline-offset-2 cursor-pointer transition-all duration-150"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={handleViewChange}
                  className="text-primary font-medium hover:underline underline-offset-2 cursor-pointer transition-all duration-150"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}