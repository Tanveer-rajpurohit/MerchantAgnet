"use client";

import Link from "next/link";
import { Lock, ArrowRight, Store } from "lucide-react";
import { AgentOrb } from "../app/utils";

interface LoginToChatCardProps {
  storeName: string;
  redirectUrl?: string;
}

export function LoginToChatCard({
  storeName,
  redirectUrl = "/shops",
}: LoginToChatCardProps) {
  const loginHref = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  const registerHref = `/register?redirect=${encodeURIComponent(redirectUrl)}`;

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-border bg-surface text-center shadow-xs flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4">
          <Store size={22} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-[11px] font-semibold mb-2">
          <AgentOrb size={11} className="not-italic text-brand" />
          <span>{storeName}</span>
        </div>

        <h3 className="text-lg sm:text-xl font-instrument text-primary font-semibold tracking-tight">
          Sign In to Chat & Order
        </h3>
        <p className="text-xs text-muted mt-1.5 mb-6 max-w-sm leading-relaxed">
          Log in with your customer account to message the store, verify real-time
          inventory, and receive payment links directly.
        </p>

        <div className="w-full flex flex-col gap-2.5">
          <Link
            href={loginHref}
            className="w-full py-2.5 rounded-xl btn-brand-solid text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Lock size={13} />
            <span>Sign In to Continue</span>
            <ArrowRight size={13} />
          </Link>

          <Link
            href={registerHref}
            className="w-full py-2.5 rounded-xl border border-border bg-bg hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
