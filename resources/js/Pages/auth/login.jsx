import { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/layouts/site-layout";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post("/login", {
      onFinish: () => reset("password"),
      onError: () => {
        toast.error("Invalid email or password.");
      },
    });
  };

  const handleDemoFill = (role = "customer") => {
    if (role === "admin") {
      setData({
        email: "admin@atelier.luxury",
        password: "password",
        remember: true,
      });
      toast.info("Admin credentials loaded! Click Sign In.");
    } else {
      setData({
        email: "demo@atelier.luxury",
        password: "password",
        remember: true,
      });
      toast.info("Customer credentials loaded! Click Sign In.");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] mt-16 pt-28 pb-16 flex items-center justify-center px-4 sm:px-6">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="size-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="size-[400px] -translate-y-24 translate-x-32 rounded-full bg-accent-soft/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Card Container */}
        <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft sm:p-9">
          {/* Header */}
          <div className="text-center">
            <span className="eyebrow inline-block mb-1.5">Account Access</span>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome Back<span className="text-accent">.</span>
            </h1>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Sign in to manage orders, wishlist items, and saved details.
            </p>
          </div>

          {/* Validation Error Banner */}
          {errors.email && (
            <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errors.email}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-accent transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  placeholder="••••••••••••"
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
              {errors.password && (
                <p className="mt-1 text-[11px] text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData("remember", e.target.checked)}
                  className="size-4 rounded border-border text-accent focus:ring-accent accent-accent"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.99] disabled:opacity-75"
            >
              {processing ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing In...
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Action */}
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 p-3 text-center space-y-2">
            <div className="text-[11px] font-semibold text-muted-foreground">Quick Test Credentials:</div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("admin")}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-xl transition-colors"
              >
                <Sparkles className="size-3" />
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("customer")}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl transition-colors"
              >
                Customer Demo
              </button>
            </div>
          </div>

          {/* Footer Register Link */}
          <div className="mt-6 border-t border-border pt-5 text-center text-xs text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-foreground transition-colors hover:text-accent hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

LoginPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default LoginPage;
