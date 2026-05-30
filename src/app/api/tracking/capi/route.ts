import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import crypto from "crypto";

const MARKETING_KEY = "marketing_settings";

function hashSHA256(text: string): string {
  return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventId, eventTime, eventSourceUrl, params } = body;
    
    // Load marketing settings from KV store
    const settings = await getKV<any>(MARKETING_KEY) || {
      metaPixelId: "",
      metaPixelEnabled: false,
      metaCapiToken: "",
      metaCapiEnabled: false,
      metaCapiTestCode: ""
    };

    if (!settings.metaCapiEnabled || !settings.metaCapiToken || !settings.metaPixelId) {
      return NextResponse.json({ 
        success: false, 
        status: "CAPI is disabled or credentials missing" 
      });
    }

    // Resolve real client IP and user agent securely
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const clientUserAgent = req.headers.get("user-agent") || "";
    
    // Format customer data (hash email if present)
    const userEmail = params?.email || params?.user_email || "";
    const hashedEmail = userEmail ? hashSHA256(userEmail) : undefined;
    
    const capiEvent: any = {
      event_name: eventName,
      event_time: Number(eventTime) || Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "website",
      event_source_url: eventSourceUrl,
      user_data: {
        client_ip_address: clientIp.split(",")[0].trim(),
        client_user_agent: clientUserAgent
      }
    };

    if (hashedEmail) {
      capiEvent.user_data.em = [hashedEmail];
    }

    // Pass custom metadata details
    if (params) {
      capiEvent.custom_data = {
        currency: params.currency || "EGP",
        value: Number(params.value) || 0,
        content_name: params.content_name || undefined,
        content_type: params.content_type || "product",
        content_ids: params.content_ids || undefined
      };
    }

    // Meta CAPI requires array format inside data
    const payload: any = {
      data: [capiEvent]
    };

    // If Test Event Code is populated in admin dashboard, send it
    if (settings.metaCapiTestCode) {
      payload.test_event_code = settings.metaCapiTestCode;
    }

    const metaUrl = `https://graph.facebook.com/v19.0/${settings.metaPixelId}/events?access_token=${settings.metaCapiToken}`;
    
    const response = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log(`[CAPI Proxy Server] Event: ${eventName}, Response:`, result);

    if (result.error) {
      return NextResponse.json({ 
        success: false, 
        error: result.error.message, 
        fb_trace_id: result.error.fb_trace_id 
      });
    }

    return NextResponse.json({ 
      success: true, 
      events_received: result.events_received, 
      fb_trace_id: result.fb_trace_id 
    });
  } catch (err: any) {
    console.error("[CAPI Proxy Exception]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
