import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,  // ✅ Your Supabase URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ✅ Service Role Key (⚠️ DO NOT expose on frontend)
);

export { supabaseAdmin };
