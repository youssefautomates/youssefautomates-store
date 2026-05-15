import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, email, firstName, lastName, phone, productId } = body;

    // 1. Authentication
    const authResponse = await fetch("https://egypt.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.PAYMOB_API_KEY,
      }),
    });
    const authData = await authResponse.json();
    const authToken = authData.token;

    if (!authToken) {
      throw new Error("Failed to get Paymob auth token");
    }

    // 2. Order Registration
    const orderResponse = await fetch("https://egypt.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: Math.round(parseFloat(amount) * 100),
        currency: "EGP",
        items: [
          {
            name: productId || "Digital Product",
            amount_cents: Math.round(parseFloat(amount) * 100),
            description: "Digital Product Purchase",
            quantity: 1
          }
        ],
      }),
    });
    const orderData = await orderResponse.json();
    const orderId = orderData.id;

    // 3. Payment Key Request
    const paymentKeyResponse = await fetch("https://egypt.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: Math.round(parseFloat(amount) * 100),
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: email,
          floor: "NA",
          first_name: firstName,
          street: "NA",
          building: "NA",
          phone_number: phone,
          shipping_method: "NA",
          postal_code: "NA",
          city: "NA",
          country: "NA",
          last_name: lastName || "Customer",
          state: "NA",
        },
        currency: "EGP",
        integration_id: process.env.PAYMOB_INTEGRATION_ID,
      }),
    });
    const paymentKeyData = await paymentKeyResponse.json();
    const paymentKey = paymentKeyData.token;

    return NextResponse.json({
      paymentKey,
      iframeUrl: `https://egypt.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
    });
  } catch (error: any) {
    console.error("Paymob Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
