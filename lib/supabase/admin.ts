import { createClient } from "@supabase/supabase-js";

// Cliente com privilégios de administrador (service_role).
// Nunca importar isso de um Client Component — só usar dentro de Server Actions,
// sempre atrás de requireAdmin().
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
