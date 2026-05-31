import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("=== PRODUCTS SCHEMA ===");
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .limit(1);
  if (error) {
    console.error("Products query error:", error);
  } else {
    console.log("Products columns:", data.length > 0 ? Object.keys(data[0]) : "No data, but table exists");
    if (data.length > 0) {
      console.log("Sample Row:", JSON.stringify(data[0], null, 2));
    }
  }
}

run();
