import { NextResponse } from "next/server";
import { getKV, setKV } from "@/lib/kv";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const REVIEWS_KEY = "product_reviews";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Review {
  id: string;
  productId: string;
  firstName: string;
  lastName: string;
  rating: number;
  text: string;
  avatarUrl: string;
  gender?: string;
  isVerified: boolean;
  isHidden: boolean;
  createdAt: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    
    let reviews: Review[] = await getKV(REVIEWS_KEY) || [];
    
    // Filter out any seeded reviews to keep ONLY the manually added ones
    const userReviews = reviews.filter(r => {
      if (!r || !r.id) return false;
      const idStr = String(r.id);
      return !idStr.startsWith("seed-") && !idStr.startsWith("seeded-");
    });
    
    if (userReviews.length !== reviews.length) {
      // Permanently write the cleaned list back to KV to purge seeded reviews
      await setKV(REVIEWS_KEY, userReviews);
      reviews = userReviews;
    }
    
    if (productId) {
      // Public fetch: filter by productId and only show non-hidden
      const productReviews = reviews.filter(r => r.productId === productId && !r.isHidden);
      // Sort newest first
      productReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json(productReviews);
    }
    
    // Admin fetch: sort newest first
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(reviews);
  } catch (err: any) {
    console.error("[Reviews API] GET Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log("[Reviews API] POST Request Received");
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || token !== "authenticated") {
      console.log("[Reviews API] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newReview = await req.json();
    console.log("[Reviews API] Payload:", JSON.stringify(newReview));
    
    newReview.id = Date.now().toString();
    newReview.createdAt = new Date().toISOString();
    
    const reviews: Review[] = await getKV(REVIEWS_KEY) || [];
    reviews.push(newReview);
    
    console.log(`[Reviews API] Attempting to save ${reviews.length} reviews to KV Store...`);
    const success = await setKV(REVIEWS_KEY, reviews);
    
    if (success) {
      console.log("[Reviews API] Successfully saved review.");
      return NextResponse.json({ success: true, review: newReview });
    }
    
    console.log("[Reviews API] setKV returned false. Failed to save.");
    return NextResponse.json({ error: "فشل حفظ التقييم" }, { status: 500 });
  } catch (err: any) {
    console.error("[Reviews API] POST Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || token !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedReview = await req.json();
    const reviews: Review[] = await getKV(REVIEWS_KEY) || [];
    const index = reviews.findIndex(r => r.id === updatedReview.id);
    
    if (index === -1) return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
    
    reviews[index] = { ...reviews[index], ...updatedReview };
    const success = await setKV(REVIEWS_KEY, reviews);
    
    if (success) return NextResponse.json({ success: true, review: reviews[index] });
    return NextResponse.json({ error: "فشل تحديث التقييم" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || token !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });

    let reviews: Review[] = await getKV(REVIEWS_KEY) || [];
    reviews = reviews.filter(r => r.id !== id);
    
    const success = await setKV(REVIEWS_KEY, reviews);
    if (success) return NextResponse.json({ success: true });
    return NextResponse.json({ error: "فشل حذف التقييم" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
