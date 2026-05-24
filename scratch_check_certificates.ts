import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("=== CERTIFICATES SCHEMA AND DATA ===");
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .limit(2);
  if (error) {
    console.error("certificates query error:", error);
  } else {
    console.log("certificates count fetched:", data.length);
    if (data.length > 0) {
      console.log("certificates record columns:", Object.keys(data[0]));
      console.log("certificates records:", JSON.stringify(data, null, 2));
    } else {
      console.log("No certificate records found in the certificates table.");
      // Let's check table info using RPC or information_schema if possible, or just list a mock select
    }
  }
}

run();
