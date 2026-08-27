import { Sidebar } from "../components/app";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Sidebar>{children}</Sidebar>;
}
