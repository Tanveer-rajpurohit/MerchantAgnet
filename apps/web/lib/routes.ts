export const MERCHANT_ROUTES = [
  "/chat",
  "/dashboard",
  "/orders",
  "/products",
  "/customers",
  "/payouts",
  "/audit-log",
  "/settings",
  "/profile",
  "/onboarding",
] as const;

export const CUSTOMER_ROUTES = [
  "/user",
] as const;

export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
] as const;

export type MerchantRoute = (typeof MERCHANT_ROUTES)[number];
export type CustomerRoute = (typeof CUSTOMER_ROUTES)[number];
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];

export function isMerchantRoute(pathname: string): boolean {
  return MERCHANT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isCustomerRoute(pathname: string): boolean {
  return CUSTOMER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
