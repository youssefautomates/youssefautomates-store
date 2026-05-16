import { NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyPaymobHmac } from "@/lib/paymob";
import { supabase } from "@/lib/supabase";
import { updateOrderStatus } from "@/lib/orders";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
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
        console.error("Invalid HMAC signature from Paymob");
        return NextResponse.json({ error: "Verification failed" }, { status: 401 });
      }
    }

    const transaction = body.obj;
    const paymobOrderId = String(transaction.order.id);
    const isSuccess = transaction.success === true;

    // 2. Update Order Status in Supabase
    if (isSuccess) {
      await updateOrderStatus(paymobOrderId, "completed", transaction);
      
      // 3. Deliver Product via Email
      const customerEmail = transaction.payment_key_claims.billing_data.email;
      const customerName = transaction.payment_key_claims.billing_data.first_name || "عميلنا العزيز";
      const amountPaid = (transaction.amount_cents / 100).toFixed(2);
      const currency = transaction.currency || "EGP";
      const transactionId = transaction.id;
      
      // Fetch all products associated with this payment ID (for cart support)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("product_id, product_title")
        .eq("payment_id", paymobOrderId);

      if (ordersData && ordersData.length > 0) {
        const productBlocks: string[] = [];
        const productTitles: string[] = [];

        for (const order of ordersData) {
          const { data: product } = await supabase
            .from("products")
            .select("file_url, image_url, title")
            .eq("id", order.product_id)
            .single();

          const downloadLink = product?.file_url || "https://youssefautomates.com";
          const productTitle = product?.title || order.product_title;
          productTitles.push(productTitle);
          
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

        // Build the professional email HTML
        const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>طلبك جاهز - Youssef Automates</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; direction: rtl;">
  
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Email Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0d0d1a; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.15);">
          
          <!-- Header with Brand -->
          <tr>
            <td style="padding: 40px 32px 24px 32px; text-align: center; background: linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: linear-gradient(135deg, #D6004B, #ff1a6d); padding: 12px 16px; border-radius: 14px; margin-bottom: 20px;">
                      <span style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">Y</span>
                    </div>
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.3px;">Youssef Automates</p>
                    <p style="margin: 4px 0 0 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">PREMIUM WORKFLOWS</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Success Badge -->
          <tr>
            <td style="padding: 0 32px 8px 32px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #052e16; border-radius: 99px; padding: 8px 20px;">
                    <span style="color: #4ade80; font-size: 13px; font-weight: 700;">✓ تم تأكيد الدفع بنجاح</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 32px 8px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.3;">
                أهلاً ${customerName}! 🎉
              </h1>
              <p style="margin: 12px 0 0 0; color: #a1a1aa; font-size: 16px; line-height: 1.7;">
                شكراً لثقتك بنا. منتجاتك الرقمية جاهزة للتحميل الفوري.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent, #27272a, transparent);"></div>
            </td>
          </tr>

          <!-- Products Section -->
          <tr>
            <td style="padding: 0 32px;">
              <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
                ${isMultiple ? "منتجاتك" : "منتجك"} الرقم${isMultiple ? "ية" : "ي"}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${productBlocks.join("")}
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">ملخص الطلب</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #a1a1aa; font-size: 14px;">رقم المعاملة</td>
                        <td style="padding: 6px 0; color: #ffffff; font-size: 14px; font-weight: 600; text-align: left; direction: ltr; font-family: monospace;">#${transactionId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #a1a1aa; font-size: 14px;">المبلغ المدفوع</td>
                        <td style="padding: 6px 0; color: #4ade80; font-size: 14px; font-weight: 700; text-align: left; direction: ltr;">${amountPaid} ${currency}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #a1a1aa; font-size: 14px;">عدد المنتجات</td>
                        <td style="padding: 6px 0; color: #ffffff; font-size: 14px; font-weight: 600; text-align: left;">${productTitles.length}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #a1a1aa; font-size: 14px;">الحالة</td>
                        <td style="padding: 6px 0; text-align: left;">
                          <span style="background-color: #052e16; color: #4ade80; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 700;">مكتمل ✓</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Important Note -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1c1917; border-radius: 12px; border-right: 4px solid #D6004B;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px 0; color: #D6004B; font-size: 13px; font-weight: 700;">⚡ ملاحظة مهمة</p>
                    <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.7;">
                      احتفظ بهذا الإيميل كمرجع. روابط التحميل ستظل متاحة. إذا واجهت أي مشكلة في الوصول للملفات، ببساطة رد على هذه الرسالة وسنساعدك فوراً.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; text-align: center; background-color: #0a0a14;">
              <p style="margin: 0 0 8px 0; color: #52525b; font-size: 13px;">
                تم الإرسال بواسطة <span style="color: #D6004B; font-weight: 700;">Youssef Automates</span>
              </p>
              <p style="margin: 0; color: #3f3f46; font-size: 11px;">
                &copy; ${new Date().getFullYear()} Youssef Automates. جميع الحقوق محفوظة.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
        `.trim();

        // Send Email via Resend
        const emailResult = await resend.emails.send({
          from: "Youssef Automates <delivery@youssefautomates.com>",
          to: customerEmail,
          replyTo: "youssefautomates@gmail.com",
          subject: `🎉 طلبك جاهز! ${subjectTitle} - Youssef Automates`,
          html: emailHtml,
          headers: {
            "X-Entity-Ref-ID": `order-${paymobOrderId}-${Date.now()}`,
          },
        });
        
        console.log(`[Webhook] ✅ Order ${paymobOrderId} completed. Email sent to ${customerEmail} for ${ordersData.length} item(s). Resend ID: ${emailResult?.data?.id || "unknown"}`);
      }
    } else {
      await updateOrderStatus(paymobOrderId, "failed", transaction);
      console.log(`[Webhook] ❌ Order ${paymobOrderId} marked as failed`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
