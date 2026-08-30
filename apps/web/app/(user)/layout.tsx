import { UserSidebar } from "../components/user/UserSidebar";
import { RoleGuard } from "../components/auth";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRole="customer">
      <UserSidebar>{children}</UserSidebar>
    </RoleGuard>
  );
}
