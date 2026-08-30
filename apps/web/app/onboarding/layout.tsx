import { RoleGuard } from "../components/auth";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRole="merchant">{children}</RoleGuard>;
}
