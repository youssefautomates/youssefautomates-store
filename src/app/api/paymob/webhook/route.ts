import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // 1. Verify Paymob HMAC Signature
    // const payload = await request.text();
    // const hmac = request.headers.get('hmac');
    // ... verification logic ...

    const data = await request.json();

    // 2. Check if the transaction is successful
    if (data.obj.success === true) {
      const orderId = data.obj.order.id;
      
      // 3. Update Order Status in Supabase
      // const { data: order, error } = await supabase
      //   .from('orders')
      //   .update({ status: 'completed' })
      //   .eq('paymob_order_id', orderId)
      //   .select('*, products(*)')
      //   .single();
      
      // 4. Generate Signed URL for PDF from Supabase Storage
      // const { data: signedUrl } = await supabase
      //   .storage
      //   .from('digital-products')
      //   .createSignedUrl(`pdfs/${order.products.pdf_path}`, 60 * 60 * 24 * 7); // Valid for 7 days

      // 5. Send Email via Resend
      /*
      await resend.emails.send({
        from: 'Digital Store <noreply@yourdomain.com>',
        to: [order.customer_email],
        subject: 'لقد تم إتمام طلبك بنجاح - حمل ملفاتك الآن',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>مرحباً ${order.customer_name}،</h2>
            <p>شكراً لشرائك <strong>${order.products.name}</strong>.</p>
            <p>يمكنك تحميل الملفات من خلال الرابط أدناه (الرابط صالح لمدة 7 أيام):</p>
            <a href="${signedUrl.signedUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">تحميل الملفات</a>
            <p>رقم طلبك: ${orderId}</p>
          </div>
        `,
      });
      */

      return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
    }

    return NextResponse.json({ message: "Transaction not successful" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
