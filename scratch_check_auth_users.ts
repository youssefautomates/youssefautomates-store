import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  console.log("=== AUTH USERS ===");
  // Note: auth.users is in auth schema, but supabase.auth.admin.listUsers() queries it.
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("List users error:", error);
  } else {
    console.log("Registered Auth Users:");
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Last Sign In: ${u.last_sign_in_at}`);
    });
  }
}

run();
