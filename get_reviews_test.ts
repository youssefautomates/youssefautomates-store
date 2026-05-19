import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("Fetching kv-product_reviews...");
  const { data, error } = await supabase
    .from("products")
    .select("description")
    .eq("slug", "kv-product_reviews")
    .maybeSingle();

  if (error) {
    console.error("Error fetching reviews:", error);
    return;
  }

  if (!data) {
    console.log("No kv-product_reviews record found in products table.");
    return;
  }

  console.log("Record description content:", data.description);
}

main();
