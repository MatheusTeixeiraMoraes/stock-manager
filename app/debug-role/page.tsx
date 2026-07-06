import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DebugRolePage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error, status } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <pre style={{ padding: 24, fontSize: 13, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(
        {
          auth_user_id: user.id,
          auth_user_email: user.email,
          query_status: status,
          query_data: data,
          query_error: error,
        },
        null,
        2
      )}
    </pre>
  );
}
