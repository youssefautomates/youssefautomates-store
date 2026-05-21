import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("=== CHECKING COURSE CATEGORIES ===");
  const { data: courseCats, error: courseCatsErr } = await supabase
    .from("course_categories")
    .select("*");

  if (courseCatsErr) {
    console.error("Error fetching course_categories:", courseCatsErr);
  } else {
    console.log(`Found ${courseCats?.length} course categories:`);
    console.log(JSON.stringify(courseCats, null, 2));
  }

  console.log("\n=== CHECKING PRODUCT CATEGORIES ===");
  const { data: prodCats, error: prodCatsErr } = await supabase
    .from("product_categories")
    .select("*");

  if (prodCatsErr) {
    console.error("Error fetching product_categories:", prodCatsErr);
  } else {
    console.log(`Found ${prodCats?.length} product categories:`);
    console.log(JSON.stringify(prodCats, null, 2));
  }

  console.log("\n=== CHECKING PRODUCTS ===");
  const { data: prods, error: prodsErr } = await supabase
    .from("products")
    .select("id, title, slug, category, status");

  if (prodsErr) {
    console.error("Error fetching products:", prodsErr);
  } else {
    console.log(`Found ${prods?.length} products:`);
    console.log(JSON.stringify(prods, null, 2));
  }
}

run();
