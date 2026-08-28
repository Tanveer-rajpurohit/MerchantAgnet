"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthFormCard } from "../../components/auth/AuthFormCard";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordStrengthBar } from "../../components/auth/PasswordStrengthBar";

type Strength = 0 | 1 | 2 | 3 | 4;

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const strength = useMemo<Strength>(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 7) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return (score || 1) as Strength;
  }, [password]);

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/onboarding");
  };

  return (
    <AuthLayout>
      <AuthFormCard>
        <div className="mb-8">
          <h1 className="font-instrument text-3xl text-primary mb-2">
            Create your account
          </h1>
          <p className="font-intert text-secondary">
            Start growing your merchant business in minutes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-muted border border-border text-primary transition-colors font-medium rounded-xl py-2.5 px-4 mb-6 font-intert"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238598)">
              <path
                fill="#4285F4"
                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
              />
              <path
                fill="#34A853"
                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
              />
              <path
                fill="#FBBC05"
                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
              />
              <path
                fill="#EA4335"
                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
              />
            </g>
          </svg>
          Google
        </button>

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg text-muted font-intert">
                or sign up with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <AuthInput
            id="name"
            type="text"
            label="Full name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <AuthInput
            id="email"
            type="email"
            label="Work email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="mb-4">
            <AuthInput
              id="password"
              type="password"
              label="Create password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPasswordToggle
              required
              className="mb-0"
            />
            {password && <PasswordStrengthBar strength={strength} />}
          </div>

          <AuthInput
            id="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showPasswordToggle
            required
          />

          <div className="flex items-start mt-2 mb-6">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-border text-brand focus:ring-brand accent-brand bg-surface mt-0.5"
              />
            </div>
            <div className="ml-2 text-sm text-secondary font-intert leading-tight">
              <label htmlFor="terms">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="link-brand">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="link-brand">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-brand-solid w-full shadow-xs font-medium rounded-xl py-3 px-4 font-intert flex items-center justify-center"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-intert text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="link-brand font-medium">
            Sign in
          </Link>
        </div>
      </AuthFormCard>
    </AuthLayout>
  );
}
