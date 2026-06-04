import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/login/login-form";
import { getAdmin } from "@/lib/auth";

export default async function AdminLoginPage() {
  const admin = await getAdmin();
  if (admin) redirect("/admin");
  return (
    <main className="subtle-grid flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
