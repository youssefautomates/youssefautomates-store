import { NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyPaymobHmac } from "@/lib/paymob";
import { supabase } from "@/lib/supabase";
import { updateOrderStatus } from "@/lib/orders";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[WEBHOOK][${requestId}] Received new webhook from Paymob`);

  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const hmac = searchParams.get("hmac");

    // 1. Verify HMAC for security
    if (body.obj) {
      const isValid = verifyPaymobHmac(
        body.obj,
        hmac || "",
        process.env.PAYMOB_HMAC_SECRET || "",
        true // POST request
      );

      if (!isValid) {
        console.error(`[WEBHOOK][${requestId}] ❌ Invalid HMAC signature`);
        return NextResponse.json({ error: "Verification failed" }, { status: 401 });
      }
    }

    const transaction = body.obj;
    if (!transaction || !transaction.order) {
      console.error(`[WEBHOOK][${requestId}] ❌ Missing transaction or order object`);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const paymobOrderId = String(transaction.order.id);
    const isSuccess = transaction.success === true;
    const txnId = transaction.id;

    console.log(`[WEBHOOK][${requestId}] Order: ${paymobOrderId} | Success: ${isSuccess} | Txn: ${txnId}`);

    // 2. Update Order Status in Supabase
    if (isSuccess) {
      console.log(`[WEBHOOK][${requestId}] 🔄 Updating order status to completed...`);
      const updatedOrders = await updateOrderStatus(paymobOrderId, "completed", transaction);
      
      if (!updatedOrders || updatedOrders.length === 0) {
        console.warn(`[WEBHOOK][${requestId}] ⚠️ No orders found with payment_id: ${paymobOrderId}`);
        // This might happen if the order is already handled or if payment_id is different
      } else {
        console.log(`[WEBHOOK][${requestId}] ✅ Order(s) updated successfully`);
      }

      // 3. Deliver Product via Email (only if needed, verify-and-deliver might do it too)
      const customerEmail = transaction.payment_key_claims?.billing_data?.email;
      const customerName = transaction.payment_key_claims?.billing_data?.first_name || "عميلنا العزيز";
      const amountPaid = (transaction.amount_cents / 100).toFixed(2);
      const currency = transaction.currency || "EGP";
      
      // Fetch orders to check if email was already sent (optional, but good for race conditions)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, product_id, product_title, status")
        .eq("payment_id", paymobOrderId);

      if (ordersData && ordersData.length > 0) {
        // Build product blocks for email
        const productBlocks: string[] = [];
        const productTitles: string[] = [];

        for (const orderItem of ordersData) {
          const { data: product } = await supabase
            .from("products")
            .select("title, sales")
            .eq("id", orderItem.product_id)
            .single();

          const downloadLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/download?token=${orderItem.id}`;
          const productTitle = product?.title || orderItem.product_title;
          productTitles.push(productTitle);
          
          // Increment product sales
          if (product) {
            await supabase
              .from("products")
              .update({ sales: (product.sales || 0) + 1 })
              .eq("id", orderItem.product_id);
          }

          productBlocks.push(`
            <tr>
              <td style="padding: 12px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 12px; overflow: hidden;">
                  <tr>
                    <td style="padding: 20px 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin: 0 0 4px 0; font-size: 11px; color: #D6004B; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">منتج رقمي</p>
                            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff; font-weight: 700;">${productTitle}</h3>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="background: linear-gradient(135deg, #D6004B, #ff1a6d); border-radius: 8px;">
                                  <a href="${downloadLink}" style="display: inline-block; padding: 12px 32px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">⬇ تحميل الملف الآن</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `);
        }

        const isMultiple = productTitles.length > 1;
        const subjectTitle = isMultiple ? `${productTitles.length} منتجات جاهزة للتحميل` : productTitles[0];

        // Build Email HTML
        const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#0d0d1a;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:40px 32px;text-align:center;background:linear-gradient(180deg,#1a1a2e 0%,#0d0d1a 100%);">
              <h1 style="margin:0;color:#ffffff;font-size:24px;">أهلاً ${customerName}! 🎉</h1>
              <p style="color:#a1a1aa;margin-top:10px;">تم تأكيد دفعك بنجاح. منتجاتك جاهزة للتحميل.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">${productBlocks.join("")}</table>
              <div style="margin-top:32px;padding:20px;background-color:#1a1a2e;border-radius:12px;">
                <p style="color:#71717a;font-size:12px;text-transform:uppercase;">ملخص الطلب</p>
                <p style="color:#ffffff;font-size:14px;margin-top:8px;">رقم المعاملة: #${txnId}</p>
                <p style="color:#4ade80;font-size:14px;font-weight:700;">المبلغ: ${amountPaid} ${currency}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;text-align:center;background-color:#0a0a14;">
              <p style="color:#52525b;font-size:12px;">&copy; ${new Date().getFullYear()} Youssef Automates</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

        if (customerEmail) {
          console.log(`[WEBHOOK][${requestId}] 📧 Sending delivery email to ${customerEmail}...`);
          await resend.emails.send({
            from: "Youssef Automates <delivery@youssefautomates.com>",
            to: customerEmail,
            subject: `🎉 طلبك جاهز! ${subjectTitle} - Youssef Automates`,
            html: emailHtml,
          });
          console.log(`[WEBHOOK][${requestId}] 📧 Email sent`);
        }
      }
    } else {
      console.log(`[WEBHOOK][${requestId}] ❌ Payment failed, updating status...`);
      await updateOrderStatus(paymobOrderId, "failed", transaction);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[WEBHOOK][${requestId}] 💥 ERROR:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
