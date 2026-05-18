import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Updating order: 93e26154-58ff-4187-a7b4-cd439101e488 to completed...");
  const { data, error } = await supabase
    .from("orders")
    .update({ 
      status: "completed"
    })
    .eq("id", "93e26154-58ff-4187-a7b4-cd439101e488")
    .select();

  if (error) {
    console.error("Error updating order:", error);
    return;
  }

  console.log("Update response:", data);
  
  // Also check products to increment sales!
  const productId = data?.[0]?.product_id;
  if (productId) {
    const { data: product } = await supabase.from("products").select("title, sales").eq("id", productId).single();
    if (product) {
      await supabase.from("products").update({ sales: (product.sales || 0) + 1 }).eq("id", productId);
      console.log(`Successfully incremented sales count for product: ${product.title}`);
    }
  }
}

main();
