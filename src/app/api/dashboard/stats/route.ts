import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkSessionIsValid } from "@/lib/coursesDb";

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const cookieStore = req.cookies;
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const deviceId = req.headers.get("x-device-id") || cookieStore.get("device_id")?.value || "unknown_device";

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
  if (authError || !user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const isSessionValid = await checkSessionIsValid(user.id, deviceId);
  if (!isSessionValid) {
    return NextResponse.json({ error: "Session invalid or revoked" }, { status: 403 });
  }

  try {
    // 1. Get total watch time
    const { data: watchSessions } = await supabaseAdmin
      .from("video_watch_sessions")
      .select("seconds_watched")
      .eq("user_id", user.id);

    const totalSeconds = watchSessions?.reduce((acc, curr) => acc + (curr.seconds_watched || 0), 0) || 0;
    const studyHours = (totalSeconds / 3600).toFixed(1);

    // 2. Get completed lessons count
    const { count: completedLessonsCount } = await supabaseAdmin
      .from("lesson_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // 3. Get current streak
    const { data: streakData } = await supabaseAdmin
      .from("student_streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .maybeSingle();

    const streak = streakData?.current_streak || 0;

    // 4. Determine student level
    let level = "مستكشف مبتدئ";
    if (totalSeconds > 3600 * 50) level = "خبير أتمتة";
    else if (totalSeconds > 3600 * 20) level = "محترف متقدم";
    else if (totalSeconds > 3600 * 5) level = "متدرب نشط";

    return NextResponse.json({
      studyHours: parseFloat(studyHours),
      completedLessons: completedLessonsCount || 0,
      streak,
      level
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
