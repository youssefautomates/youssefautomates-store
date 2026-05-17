import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/download?token=ORDER_ID
 * 
 * Secure download proxy. Verifies order status before redirecting to the actual file.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Verify order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("status, product_id")
      .eq("id", token)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "completed") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 403 });
    }

    // 2. Get product file URL
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("file_url")
      .eq("id", order.product_id)
      .single();

    if (productError || !product || !product.file_url) {
      return NextResponse.json({ error: "Product file not found" }, { status: 404 });
    }

    // 3. Redirect to the actual file (or stream it if you want more protection)
    // For now, redirecting to the URL (which could be a signed URL from storage)
    return NextResponse.redirect(product.file_url);

  } catch (error) {
    console.error("[DOWNLOAD_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
