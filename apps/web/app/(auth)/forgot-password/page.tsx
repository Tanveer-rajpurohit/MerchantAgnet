"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout, AuthFormCard, AuthInput } from "../../components/auth";
import { authService } from "../../../lib/api/services/authService";
import { ApiError } from "../../../lib/api/utils/fetchClient";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get("email");
  const queryCode = searchParams.get("code");

  const [step, setStep] = useState<"forgot" | "reset">(
    queryEmail && queryCode ? "reset" : "forgot"
  );
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
    if (queryCode) {
      setCode(queryCode);
      setStep("reset");
    }
  }, [queryEmail, queryCode]);

  const validateForgotPassword = (): boolean => {
    if (!email.trim()) {
      setErrorMessage("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const validateResetPassword = (): boolean => {
    if (!email.trim()) {
      setErrorMessage("Email address is required.");
      return false;
    }
    if (!code.trim()) {
      setErrorMessage("Reset code is required.");
      return false;
    }
    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForgotPassword()) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSuccessMessage("If an account exists, a 6-character reset code has been sent.");
      setStep("reset");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unable to send reset code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateResetPassword()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(email.trim(), code.trim(), newPassword);
      setSuccessMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 700);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unable to reset password. Please verify your code and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthFormCard>
        <div className="mb-8">
          <h1 className="font-instrument text-3xl text-primary mb-2">
            {step === "reset" ? "Reset Password" : "Forgot Password"}
          </h1>
          <p className="font-intert text-secondary">
            {step === "reset"
              ? "Enter your email, the 6-character reset code, and your new password."
              : "Enter your email address to receive a 6-character password reset code."}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium font-intert">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium font-intert">
            {successMessage}
          </div>
        )}

        {step === "forgot" ? (
          <form onSubmit={handleForgotSubmit} className="w-full">
            <AuthInput
              id="email"
              type="email"
              label="Email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 btn-brand-solid w-full shadow-xs font-medium rounded-xl py-3 px-4 font-intert flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
            >
              {isLoading ? "Sending Code..." : "Send Reset Code"}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setStep("reset");
                }}
                className="text-xs font-intert text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                Already have a reset code? Enter it here
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="w-full space-y-4">
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
              id="code"
              type="text"
              label="Reset Code (6 characters)"
              placeholder="e.g. K9P2X7"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />

            <AuthInput
              id="newPassword"
              type="password"
              label="New Password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showPasswordToggle
              required
            />

            <AuthInput
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPasswordToggle
              required
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-brand-solid w-full shadow-xs font-medium rounded-xl py-3 px-4 font-intert flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setStep("forgot");
                }}
                className="text-xs font-intert text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                Need to request a new code?
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-sm font-intert text-secondary">
          <Link href="/login" className="link-brand font-medium">
            Back to Login
          </Link>
        </div>
      </AuthFormCard>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthLayout><AuthFormCard><div className="flex justify-center p-8">Loading...</div></AuthFormCard></AuthLayout>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
