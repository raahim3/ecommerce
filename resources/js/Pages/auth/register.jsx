import { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/layouts/site-layout";

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    agree: true,
  });

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!data.password) return 0;
    let score = 0;
    if (data.password.length >= 8) score += 1;
    if (/[A-Z]/.test(data.password)) score += 1;
    if (/[0-9]/.test(data.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(data.password)) score += 1;
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
    if (data.password !== data.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (!data.agree) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    post("/register", {
      onFinish: () => reset("password", "password_confirmation"),
      onError: () => {
        toast.error("Please resolve the errors highlighted below.");
      },
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] pt-28 pb-16 flex items-center justify-center px-4 sm:px-6">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="size-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="size-[400px] translate-y-24 -translate-x-32 rounded-full bg-accent-soft/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="group mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Store
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft sm:p-9">
          <div className="text-center">
            <span className="eyebrow inline-block mb-1.5">New Client Privileges</span>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Create Account<span className="text-accent">.</span>
            </h1>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Enjoy tailored recommendations, order tracking, and exclusive previews.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  placeholder="Eleanor Vance"
                  required
                  className="h-11 w-full rounded-2xl border border-border bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent focus:bg-surface focus:outline-none"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-[11px] text-destructive">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-11 w-full rounded-2xl border border-border bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent focus:bg-surface focus:outline-none"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-destructive">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  placeholder="Minimum 8 characters"
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
              {data.password && (
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
              {errors.password && (
                <p className="mt-1 text-[11px] text-destructive">{errors.password}</p>
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
                  value={data.password_confirmation}
                  onChange={(e) => setData("password_confirmation", e.target.value)}
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
                  checked={data.agree}
                  onChange={(e) => setData("agree", e.target.checked)}
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
              disabled={processing}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.99] disabled:opacity-75"
            >
              {processing ? (
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
              href="/login"
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

RegisterPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default RegisterPage;
