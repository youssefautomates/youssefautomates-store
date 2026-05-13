import { NextResponse } from "next/server";

// This is an alternative Paymob webhook endpoint.
// The primary webhook handler is at /api/webhook/paymob/route.ts

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Check if the transaction is successful
    if (data.obj && data.obj.success === true) {
      const orderId = data.obj.order.id;

      // TODO: Update Order Status in Supabase
      // TODO: Generate Signed URL for PDF from Supabase Storage
      // TODO: Send Email via Resend

      console.log("Webhook processed for order: " + String(orderId));

      return NextResponse.json(
        { message: "Webhook processed successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Transaction not successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
