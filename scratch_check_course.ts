import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("=== COURSE DETAILS ===");
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, certificate_bg_url, certificate_name_x, certificate_name_y, certificate_name_size");
  if (error) {
    console.error("courses query error:", error);
  } else {
    console.log("courses records:", JSON.stringify(data, null, 2));
  }
}

run();
