import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkSessionIsValid } from "@/lib/coursesDb";
import { generateSignedEmbedUrl } from "@/lib/bunny";

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const resolvedParams = await params;
  const lessonId = resolvedParams.lessonId;

  // 1. Get access token from cookie
  const cookieStore = req.cookies;
  const accessToken = cookieStore.get("sb-access-token")?.value;
  // Get deviceId from cookie or headers
  const deviceId = req.headers.get("x-device-id") || cookieStore.get("device_id")?.value || "unknown_device";

  if (!accessToken) {
    return new Response("غير مصرح بالوصول - يجب تسجيل الدخول أولاً", { status: 401 });
  }

  // 2. Validate token and get user using Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response("إعدادات خادم Supabase غير مكتملة", { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    return new Response("جلسة عمل غير صالحة أو منتهية الصلاحية", { status: 401 });
  }

  // Check session validity (also checks suspension)
  const isSessionValid = await checkSessionIsValid(user.id, deviceId);
  if (!isSessionValid) {
    return new Response("جلسة العمل ملغاة بسبب الدخول المتعدد أو إيقاف الحساب", { status: 403 });
  }

  try {
    // 3. Find the lesson details
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from("course_lessons")
      .select("id, module_id, video_id, video_url, is_preview")
      .eq("id", lessonId)
      .maybeSingle();

    if (lessonError || !lesson) {
      return new Response("المحاضرة المطلوبة غير موجودة", { status: 404 });
    }

    if (!lesson.video_id) {
      // If it doesn't have a Bunny video_id but has a raw video_url, redirect directly to it
      if (lesson.video_url) {
        return NextResponse.redirect(lesson.video_url);
      }
      return new Response("فيديو المحاضرة غير متوفر حالياً", { status: 404 });
    }

    // 4. Check enrollment if not preview
    let isAuthorized = !!lesson.is_preview;

    if (!isAuthorized) {
      // Get course_id by checking course_modules
      const { data: moduleData, error: moduleError } = await supabaseAdmin
        .from("course_modules")
        .select("course_id")
        .eq("id", lesson.module_id)
        .maybeSingle();

      if (!moduleError && moduleData) {
        const { data: enrollment } = await supabaseAdmin
          .from("enrollments")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("course_id", moduleData.course_id)
          .maybeSingle();

        if (enrollment && enrollment.status === "active") {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return new Response("يجب الاشتراك في هذا الكورس أولاً لمشاهدة الفيديو", { status: 403 });
    }

    // 5. Generate secure signed Bunny embed URL
    const signedEmbedUrl = generateSignedEmbedUrl(lesson.video_id, 120); // 2 hours expiry

    // Parse incoming query params (e.g. time=X) and append to signed Bunny embed url
    const reqUrl = new URL(req.url);
    const incomingParams = reqUrl.searchParams.toString();
    const finalEmbedUrl = incomingParams 
      ? `${signedEmbedUrl}${signedEmbedUrl.includes("?") ? "&" : "?"}${incomingParams}`
      : signedEmbedUrl;

    // Redirect the iframe to the secure signed embed URL
    const responseHeaders = new Headers();
    responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    responseHeaders.set("Pragma", "no-cache");

    return NextResponse.redirect(finalEmbedUrl, {
      headers: responseHeaders
    });

  } catch (err: any) {
    return new Response(`Embed generation error: ${err.message}`, { status: 500 });
  }
}
