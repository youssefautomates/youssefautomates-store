import { NextResponse } from "next/server";
import { verifyPaymobHmac } from "@/lib/paymob";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
);

/**
 * GET /api/paymob/callback
 * 
 * This is the redirect URL Paymob sends the customer to after 3DS/OTP verification.
 * We verify the HMAC, then redirect to our own success or failed page.
 * 
 * This ensures Store customers NEVER get redirected to JoeSchool or any external page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hmac = searchParams.get("hmac");
  
  // Convert searchParams to an object for HMAC verification
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // 1. Verify HMAC for security
  const isValid = verifyPaymobHmac(
    params,
    hmac || "",
    process.env.PAYMOB_HMAC_SECRET || "",
    false // GET request
  );

  if (!isValid) {
    console.error("[CALLBACK] ❌ Invalid HMAC signature from Paymob callback");
    return NextResponse.redirect(new URL("/checkout/failed?reason=verification_failed", request.url));
  }

  // 2. Check Transaction Success
  const success = searchParams.get("success") === "true";
  const orderId = searchParams.get("order");
  const merchantOrderId = searchParams.get("merchant_order_id") || "";

  console.log(`[CALLBACK] Success: ${success} | Order: ${orderId} | MerchantOrder: ${merchantOrderId}`);

  // 3. Always redirect to Youssef Automates Store pages
  // This guarantees store customers never see JoeSchool pages
  const reason = searchParams.get("txn_response_code") || "declined";
  
  // Extract real Supabase UUID — try multiple resolution strategies
  let realOrderId = orderId;

  // Strategy 1: Classic API merchant_order_id with "store-" prefix
  if (merchantOrderId && merchantOrderId.startsWith("store-")) {
    realOrderId = merchantOrderId.replace("store-", "");
  } else {
    // Strategy 2: For Intention API (wallet) payments, look up the Supabase order
    // by querying the DB for orders whose payment_id matches the Paymob order ID
    // or whose payment_id is the intention ID that created this Paymob order
    try {
      // First try: direct payment_id match with the Paymob order ID
      let dbOrder = null;
      const { data: byPaymentId } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("payment_id", String(orderId))
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (byPaymentId) {
        dbOrder = byPaymentId;
      }
      
      // Second try: if merchant_order_id exists but without "store-" prefix, try it directly as UUID
      if (!dbOrder && merchantOrderId) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(merchantOrderId);
        if (isUuid) {
          dbOrder = { id: merchantOrderId };
        }
      }
      
      if (dbOrder) {
        realOrderId = dbOrder.id;
        console.log(`[CALLBACK] ✅ Resolved Supabase UUID from DB: ${realOrderId}`);
      } else {
        console.warn(`[CALLBACK] ⚠️ Could not resolve Supabase UUID. Using Paymob Order ID: ${orderId}`);
      }
    } catch (err) {
      console.error(`[CALLBACK] ⚠️ DB lookup error during UUID resolution:`, err);
    }
  }
  
  if (success || reason === "verification_timeout") {
    // If verification_timeout, send to success page anyway so the robust
    // verify-and-deliver API can check Paymob directly. Often it's a false negative.
    return NextResponse.redirect(new URL(`/checkout/success?order_id=${realOrderId}&paymob_order_id=${orderId}`, request.url));
  } else {
    return NextResponse.redirect(new URL(`/checkout/failed?order_id=${realOrderId}&reason=${reason}`, request.url));
  }
}
