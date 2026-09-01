"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: "merchant" | "customer";
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const mounted = useIsMounted();
  const { user, isAuthenticated, isLoading, isOnboarded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user?.role !== allowedRole) {
      if (user?.role === "customer") {
        router.replace("/user");
      } else if (user?.role === "merchant") {
        router.replace(isOnboarded ? "/chat" : "/onboarding");
      }
    }
  }, [mounted, isAuthenticated, isLoading, user, allowedRole, isOnboarded, router, pathname]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
