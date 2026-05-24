import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("🔍 Inspecting 'orders' table in remote Supabase...");
  
  // We select one order or just query standard columns
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .limit(1);

  if (error) {
    console.error("❌ Error fetching from 'orders' table:", error);
    return;
  }

  if (data) {
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    console.log("📋 Existing columns in 'orders' table:", columns);
    
    const required = ["original_amount_usd", "charged_amount_egp", "exchange_rate", "currency"];
    console.log("\n🔎 Verification of target columns:");
    required.forEach(col => {
      const exists = columns.includes(col);
      console.log(`- ${col}: ${exists ? "✅ EXISTS" : "❌ MISSING"}`);
    });
  }
}

run();
