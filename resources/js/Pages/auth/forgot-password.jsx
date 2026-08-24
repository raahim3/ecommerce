import { useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/layouts/site-layout";

export function ForgotPasswordPage() {
  const { flash } = usePage().props;
  const { data, setData, post, processing, errors } = useForm({
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    post("/forgot-password", {
      onSuccess: () => {
        setIsSubmitted(true);
        toast.success("Password reset instructions dispatched!");
      },
      onError: () => {
        toast.error("Could not find an account with that email.");
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
          {!isSubmitted && !flash?.status ? (
            <>
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-muted/80 text-foreground">
                  <KeyRound className="size-5" />
                </div>
                <span className="eyebrow inline-block mb-1">Security</span>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Forgot Password<span className="text-accent">?</span>
                </h1>
                <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                  No worries. Enter your account email and we&apos;ll send you instructions to reset your password.
                </p>
              </div>

              {/* Error banner */}
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

                <button
                  type="submit"
                  disabled={processing}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.99] disabled:opacity-75"
                >
                  {processing ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Sending Instructions...
                    </span>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success / Confirmation State */
            <div className="text-center">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-accent/15 text-accent animate-pop">
                <CheckCircle2 className="size-7" />
              </div>
              <span className="eyebrow inline-block mb-1">Check Your Inbox</span>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Reset Link Sent
              </h2>
              <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
                We sent password reset instructions to:
                <br />
                <strong className="text-foreground font-semibold mt-1 inline-block">
                  {data.email || "your email"}
                </strong>
              </p>

              <div className="mt-8 space-y-3">
                <Link
                  href="/login"
                  className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Return to Sign In
                </Link>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border text-xs font-semibold text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" />
                  Try a different email
                </button>
              </div>
            </div>
          )}

          {/* Footer Back */}
          <div className="mt-6 border-t border-border pt-5 text-center text-xs text-muted-foreground">
            Remember your password?{" "}
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

ForgotPasswordPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default ForgotPasswordPage;
