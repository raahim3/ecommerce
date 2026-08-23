import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();

  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength <= 1) return "Weak";
    if (strength <= 3) return "Good";
    return "Strong";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Account created successfully!", {
        description: `Welcome to Atelier, ${name}`,
      });
      navigate("/");
    }, 900);
  };

  const handleSocialRegister = (provider) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Account created with ${provider}!`);
      navigate("/");
    }, 700);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] pt-28 pb-16 flex items-center justify-center px-4 sm:px-6">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="size-[500px] -translate-x-20 translate-y-12 rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Link */}
        <Link
          to="/"
          className="group mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Store
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft sm:p-9">
          <div className="text-center">
            <span className="eyebrow inline-block mb-1.5">Join Atelier</span>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Create Account<span className="text-accent">.</span>
            </h1>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Enjoy express checkout, order tracking, and member exclusives.
            </p>
          </div>

          {/* Social Buttons */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialRegister("Google")}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 text-xs font-semibold transition-all hover:bg-muted hover:border-foreground/20 active:scale-[0.98]"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialRegister("Apple")}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 text-xs font-semibold transition-all hover:bg-muted hover:border-foreground/20 active:scale-[0.98]"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.88-.9.04-2 .6-2.65 1.36-.57.65-1.07 1.73-.93 2.76 1 .08 2.02-.48 2.65-1.24z" />
              </svg>
              Apple
            </button>
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-surface px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Eleanor Vance"
                  required
                  className="h-11 w-full rounded-2xl border border-border bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent focus:bg-surface focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-11 w-full rounded-2xl border border-border bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent focus:bg-surface focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="h-11 w-full rounded-2xl border border-border bg-muted/20 pl-10 pr-11 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent focus:bg-surface focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Strength:</span>
                    <span className="font-semibold text-foreground">
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="flex h-1 gap-1 overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 1 ? "bg-destructive" : "bg-transparent"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 2 ? "bg-amber-500" : "bg-transparent"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 3 ? "bg-accent" : "bg-transparent"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        strength >= 4 ? "bg-emerald-500" : "bg-transparent"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your password"
                  required
                  className="h-11 w-full rounded-2xl border border-border bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent focus:bg-surface focus:outline-none"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border text-accent focus:ring-accent accent-accent"
                />
                <span>
                  I agree to the{" "}
                  <a href="#terms" className="text-foreground underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#privacy" className="text-foreground underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.99] disabled:opacity-75"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 border-t border-border pt-5 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-foreground transition-colors hover:text-accent hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
