import { useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/layouts/site-layout";

export function ResetPasswordPage() {
  const { email, token } = usePage().props;
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    token: token || "",
    email: email || "",
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.password !== data.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    post("/reset-password", {
      onFinish: () => reset("password", "password_confirmation"),
      onError: () => {
        toast.error("Failed to reset password. Please check the errors.");
      },
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] pt-28 pb-16 flex items-center justify-center px-4 sm:px-6">
      {/* Ambience */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="size-[450px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link
          href="/login"
          className="group mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Sign In
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-surface p-7 shadow-soft sm:p-9">
          <div className="text-center">
            <span className="eyebrow inline-block mb-1">Account Recovery</span>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Set New Password<span className="text-accent">.</span>
            </h1>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Please enter your account email and choose a strong new password.
            </p>
          </div>

          {errors.email && (
            <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errors.email}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
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
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                New Password
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
              {errors.password && (
                <p className="mt-1 text-[11px] text-destructive">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={data.password_confirmation}
                  onChange={(e) => setData("password_confirmation", e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="h-11 w-full rounded-2xl border border-border bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-accent focus:bg-surface focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.99] disabled:opacity-75"
            >
              {processing ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Updating Password...
                </span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

ResetPasswordPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default ResetPasswordPage;
