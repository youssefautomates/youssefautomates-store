import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  try {
    const { supabaseAdmin } = await import("./src/lib/supabaseAdmin");
    const { data: courses, error } = await supabaseAdmin
      .from("courses")
      .select("id, title, slug, showcase_videos");

    if (error) {
      console.error("DB Error:", error.message);
      return;
    }

    console.log("Found courses:", courses.length);
    for (const c of courses) {
      console.log(`\nCourse: ${c.title} (${c.slug})`);
      console.log("Showcase videos:", JSON.stringify(c.showcase_videos, null, 2));
    }
  } catch (err: any) {
    console.error("Run error:", err.message);
  }
}

run();
