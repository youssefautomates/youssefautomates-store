import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const libraryId = process.env.BUNNY_LIBRARY_ID || "";
const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || "";

function generateSignedHlsUrl(videoId: string, expirationMinutes = 120): string {
  const expiration = Math.floor(Date.now() / 1000) + expirationMinutes * 60;
  const signature = crypto
    .createHash("sha256")
    .update(tokenKey + videoId + expiration.toString())
    .digest("hex");
  return `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}/thumbnail.jpg?token=${signature}&expires=${expiration}`;
}

async function run() {
  const testVideoId = "62cea704-3025-49b6-99a9-61f97a9a3ae3";
  const signedThumbUrl = generateSignedHlsUrl(testVideoId, 120);
  console.log("Fetching signed thumbnail url:", signedThumbUrl);

  try {
    const res = await fetch(signedThumbUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "http://localhost:3000/"
      }
    });
    console.log("Status Code:", res.status);
    console.log("Content-Type:", res.headers.get("Content-Type"));
  } catch (e: any) {
    console.error("Fetch error:", e.message);
  }
}

run();
