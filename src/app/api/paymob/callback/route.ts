import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  // Paymob sends transaction details in search params
  const success = searchParams.get("success");
  const orderId = searchParams.get("order");
  const txnId = searchParams.get("id");

  if (success === "true") {
    // Redirect to the success page with order details
    return NextResponse.redirect(new URL(`/success?order_id=${orderId}&txn_id=${txnId}`, req.url));
  } else {
    // Redirect back to checkout or a failure page
    return NextResponse.redirect(new URL(`/checkout/error?order_id=${orderId}`, req.url));
  }
}
