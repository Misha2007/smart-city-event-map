import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/admin-utils";
import AdminDashboard from "@/components/admin-dashboard";

export default async function AdminPage() {
  const hasAccess = await checkAdminAccess();

  if (!hasAccess) {
    redirect("/");
  }

  return <AdminDashboard />;
}
