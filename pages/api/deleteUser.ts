import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role Key (Backend Only)
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId } = req.body; // Get user ID from request

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Delete the user via Supabase Admin API
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "User deleted successfully" });
}
