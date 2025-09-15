import { createClient } from "@/lib/supabase/server";

export async function checkAdminAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return roleData?.role === "admin" || roleData?.role === "moderator";
}

export async function getUserRole(userId: string) {
  const supabase = await createClient();

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  return roleData?.role || "user";
}
