import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: lessons, error } = await supabase
    .from("course_lessons")
    .select("id, title, video_id, video_url")
    .limit(10);

  if (error) {
    console.error("Error fetching lessons:", error);
    return;
  }

  console.log(`Found ${lessons.length} lessons:`);
  console.log(JSON.stringify(lessons, null, 2));
}

run();
