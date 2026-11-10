"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/forms/FormError";
import { useAuth } from "@/lib/auth";
import { useCompany } from "@/lib/company";
import { useToast } from "@/lib/toast";
import { useForm } from "@/lib/useForm";
import { validateLogin, type LoginValues } from "@/lib/validation";
import { inputClass, invalidInputClass, labelClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const router = useRouter();
  const { user, ready, login } = useAuth();
  const { profile } = useCompany();
  const { showToast } = useToast();
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { values, errors, formError, setValue, setFormError, submit } =
    useForm<LoginValues>({ username: "", password: "" }, validateLogin);

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      setSubmitting(true);
      void login(draft.username, draft.password, remember)
        .then((error) => {
          if (error) {
            setFormError(error);
            return;
          }
          showToast("Signed in successfully");
          router.replace("/");
        })
        .catch((error: unknown) =>
          setFormError(
            error instanceof Error && error.message
              ? error.message
              : "Unable to sign in. Please try again.",
          ),
        )
        .finally(() => setSubmitting(false));
    });
  }

  if (!ready || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <i
          className="fas fa-circle-notch fa-spin text-2xl text-brand-500"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="fade-in text-center">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt={`${profile.name} logo`}
                className="mx-auto mb-4 h-16 w-16 rounded-2xl object-contain"
              />
            ) : null}
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {profile.name}
            </h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-username" className={labelClass}>
                Username
              </label>
              <div className="relative">
                <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={values.username}
                  onChange={(event) =>
                    setValue("username", event.target.value)
                  }
                  className={cn(
                    inputClass,
                    "pl-10",
                    errors.username && invalidInputClass,
                  )}
                  aria-invalid={errors.username ? true : undefined}
                  aria-describedby={
                    errors.username ? "login-username-error" : undefined
                  }
                  placeholder="Enter your username"
                />
              </div>
              {errors.username ? (
                <p
                  id="login-username-error"
                  role="alert"
                  className="mt-1 text-xs text-rose-600"
                >
                  {errors.username}
                </p>
              ) : null}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="login-password" className={labelClass}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    showToast("Password reset is not available in this demo")
                  }
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(event) =>
                    setValue("password", event.target.value)
                  }
                  className={cn(
                    inputClass,
                    "pl-10 pr-10",
                    errors.password && invalidInputClass,
                  )}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
              </div>
              {errors.password ? (
                <p
                  id="login-password-error"
                  role="alert"
                  className="mt-1 text-xs text-rose-600"
                >
                  {errors.password}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Remember me
              </label>
            </div>

            <FormError message={formError} />

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i
                className={`fas ${submitting ? "fa-circle-notch fa-spin" : "fa-right-to-bracket"}`}
              />
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Create one
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-slate-400">
            Accounts are secured by Neon Auth. Shop data is stored in your Neon
            Postgres database.
          </p>
        </div>
      </main>
    </div>
  );
}
