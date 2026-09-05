"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout, AuthFormCard, AuthInput, GoogleAuthButton } from "../../components/auth";
import { useAuth } from "../../../context/AuthContext";
import { authService } from "../../../lib/api/services/authService";
import { ApiError } from "../../../lib/api/utils/fetchClient";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const { login, isLoggingIn } = useAuth();
  const router = useRouter();

  const validate = (): boolean => {
    if (!email.trim()) {
      setErrorMessage("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setErrorMessage("Password is required.");
      return false;
    }
    return true;
  };

  const handleSuccessfulAuth = async () => {
    const me = await authService.getMe();
    if (me.role === "merchant") {
      router.push(me.onboarding_completed_at ? "/chat" : "/onboarding");
    } else {
      router.push("/user");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    try {
      await login({ email: email.trim(), password });
      await handleSuccessfulAuth();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unable to sign in. Please try again.");
      }
    }
  };

  return (
    <AuthLayout>
      <AuthFormCard>
        <div className="mb-8">
          <h1 className="font-instrument text-3xl text-primary mb-2">
            Welcome back
          </h1>
          <p className="font-intert text-secondary">
            Sign in to your MerchantAgent workspace.
          </p>
        </div>

        {resetSuccess && !errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium font-intert">
            Password reset successfully! Please sign in with your new password.
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium font-intert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <AuthInput
            id="email"
            type="email"
            label="Email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AuthInput
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle
            required
            rightLabel={
              <Link href="/forgot-password" className="link-brand text-sm">
                Forgot password?
              </Link>
            }
          />

          <div className="flex items-center mt-2 mb-6">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand accent-brand bg-surface"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-secondary font-intert"
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="btn-brand-solid w-full shadow-xs font-medium rounded-xl py-3 px-4 font-intert flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
          >
            {isLoggingIn ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg text-muted font-intert">
                or continue with
              </span>
            </div>
          </div>
        </div>

        <GoogleAuthButton
          text="Google"
          onError={(msg) => setErrorMessage(msg)}
        />

        <div className="mt-8 text-center text-sm font-intert text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="link-brand font-medium">
            Create one free
          </Link>
        </div>
      </AuthFormCard>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLayout><AuthFormCard><div className="flex justify-center p-8">Loading...</div></AuthFormCard></AuthLayout>}>
      <LoginForm />
    </Suspense>
  );
}
