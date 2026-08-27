"use client";

import React, { useState } from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightLabel?: React.ReactNode;
  hasError?: boolean;
  errorMessage?: string;
  showPasswordToggle?: boolean;
}

export function AuthInput({
  label,
  rightLabel,
  hasError,
  errorMessage,
  showPasswordToggle,
  type,
  className,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className || "mb-4"}`}>
      <div className="flex justify-between items-center">
        <label
          htmlFor={props.id}
          className="text-sm font-medium text-primary font-intert"
        >
          {label}
        </label>
        {rightLabel && <div className="text-sm font-intert">{rightLabel}</div>}
      </div>
      <div className="relative">
        <input
          type={inputType}
          className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-primary font-intert placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all ${
            hasError
              ? "border-danger focus:ring-danger focus:border-danger"
              : "border-border"
          }`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors flex items-center justify-center p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {hasError && errorMessage && (
        <span className="text-xs text-danger font-intert mt-1">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
