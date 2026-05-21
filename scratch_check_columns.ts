import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // Let's inspect course_modules
  console.log("=== COURSE_MODULES SCHEMA ===");
  const { data: moduleData, error: moduleErr } = await supabase
    .from("course_modules")
    .select("*")
    .limit(1);
  if (moduleErr) {
    console.error("course_modules error:", moduleErr);
  } else {
    console.log("course_modules columns:", moduleData.length > 0 ? Object.keys(moduleData[0]) : "No data, but table exists");
  }

  // Let's inspect course_lessons
  console.log("\n=== COURSE_LESSONS SCHEMA ===");
  const { data: lessonData, error: lessonErr } = await supabase
    .from("course_lessons")
    .select("*")
    .limit(1);
  if (lessonErr) {
    console.error("course_lessons error:", lessonErr);
  } else {
    console.log("course_lessons columns:", lessonData.length > 0 ? Object.keys(lessonData[0]) : "No data, but table exists");
  }
}

run();
