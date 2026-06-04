import { AdminShell } from "@/components/admin-shell";
import { getAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) return children;
  return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}
