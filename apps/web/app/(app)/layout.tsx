import { Sidebar } from "../components/app";
import { RoleGuard } from "../components/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="merchant">
      <Sidebar>{children}</Sidebar>
    </RoleGuard>
  );
}
