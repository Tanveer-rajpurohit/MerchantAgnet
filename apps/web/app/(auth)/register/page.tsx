"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, User } from "lucide-react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthFormCard } from "../../components/auth/AuthFormCard";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordStrengthBar } from "../../components/auth/PasswordStrengthBar";

type Strength = 0 | 1 | 2 | 3 | 4;

export default function RegisterPage() {
  const [role, setRole] = useState<"merchant" | "customer">("merchant");
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
    if (role === "merchant") {
      router.push("/onboarding");
    } else {
      router.push("/user");
    }
  };

  return (
    <AuthLayout>
      <AuthFormCard>
        <div className="mb-6">
          <h1 className="font-instrument text-3xl text-primary mb-1.5">
            Create your account
          </h1>
          <p className="font-intert text-secondary text-sm">
            {role === "merchant"
              ? "Start growing your merchant business with AI in minutes."
              : "Shop and order from local stores via AI Copilot."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-muted border border-border mb-6 font-intert">
          <button
            type="button"
            onClick={() => setRole("merchant")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              role === "merchant"
                ? "bg-surface text-primary shadow-xs font-semibold border border-border"
                : "text-muted hover:text-primary"
            }`}
          >
            <Store
              size={13}
              className={role === "merchant" ? "text-brand" : "text-muted"}
            />
            <span>Merchant / Seller</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              role === "customer"
                ? "bg-surface text-primary shadow-xs font-semibold border border-border"
                : "text-muted hover:text-primary"
            }`}
          >
            <User
              size={13}
              className={role === "customer" ? "text-brand" : "text-muted"}
            />
            <span>Buyer / Customer</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            role === "merchant"
              ? router.push("/onboarding")
              : router.push("/user")
          }
          className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-muted border border-border text-primary transition-colors font-medium rounded-xl py-2.5 px-4 mb-6 font-intert text-xs"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
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
          Continue with Google
        </button>

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-bg text-muted font-intert">
                or sign up with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label={role === "merchant" ? "Store Owner Name" : "Your Full Name"}
            type="text"
            placeholder={
              role === "merchant" ? "Tanveer Sharma" : "Rahul Sharma"
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <AuthInput
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <AuthInput
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPasswordToggle
              required
            />
            {password.length > 0 && <PasswordStrengthBar strength={strength} />}
          </div>

          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showPasswordToggle
            required
          />

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer shadow-xs"
            >
              {role === "merchant"
                ? "Create Merchant Account"
                : "Create Buyer Account"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-muted font-intert">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </AuthFormCard>
    </AuthLayout>
  );
}
