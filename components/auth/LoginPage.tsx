"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/forms/FormError";
import { DEMO_ACCOUNTS, useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { useForm } from "@/lib/useForm";
import { validateLogin, type LoginValues } from "@/lib/validation";
import { inputClass, invalidInputClass, labelClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

const demo = DEMO_ACCOUNTS[0];

export function LoginPage() {
  const router = useRouter();
  const { user, ready, login } = useAuth();
  const { showToast } = useToast();
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { values, errors, formError, setValue, setFormError, submit } =
    useForm<LoginValues>({ email: "", password: "" }, validateLogin);

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    submit(event, (draft) => {
      const error = login(draft.email, draft.password, remember);
      if (error) {
        setFormError(error);
        return;
      }
      showToast("Signed in successfully");
      router.replace("/");
    });
  }

  if (!ready || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <i
          className="fas fa-circle-notch fa-spin text-2xl text-brand-500"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="fade-in text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              SINTechshop
            </h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className={labelClass}>
                Email address
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => setValue("email", event.target.value)}
                  className={cn(
                    inputClass,
                    "pl-10",
                    errors.email && invalidInputClass,
                  )}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={
                    errors.email ? "login-email-error" : undefined
                  }
                  placeholder="you@techvault.com"
                />
              </div>
              {errors.email ? (
                <p
                  id="login-email-error"
                  role="alert"
                  className="mt-1 text-xs text-rose-600"
                >
                  {errors.email}
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <i className="fas fa-right-to-bracket" />
              Sign in
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">
                  Demo account
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {demo.email}
                </p>
                <p className="text-sm text-slate-500">
                  Password: {demo.password}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue("email", demo.email);
                  setValue("password", demo.password);
                  setFormError(null);
                }}
                className="shrink-0 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
              >
                Fill
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Protected demo environment. Data is stored locally in this browser.
          </p>
        </div>
      </main>
    </div>
  );
}
