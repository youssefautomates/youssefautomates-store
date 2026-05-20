import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const libraryId = process.env.BUNNY_LIBRARY_ID || "";
const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || "";
const testVideoId = "d7d09e77-9b58-4e2c-ab68-2c7134c41e09";

function generateSignedEmbedUrl(videoId: string, expirationMinutes = 120): string {
  const expiration = Math.floor(Date.now() / 1000) + expirationMinutes * 60;
  const signature = crypto
    .createHash("sha256")
    .update(tokenKey + videoId + expiration.toString())
    .digest("hex");
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${signature}&expires=${expiration}`;
}

async function run() {
  console.log("Library ID:", libraryId);
  console.log("Token Key:", tokenKey ? "PRESENT" : "MISSING");
  
  if (!libraryId || !tokenKey) {
    console.error("Missing config!");
    return;
  }

  // Generate signed URL
  const signedUrl = generateSignedEmbedUrl(testVideoId);
  console.log("Generated Signed URL:", signedUrl);

  // Fetch with referer
  try {
    const res = await fetch(signedUrl, {
      headers: {
        "Referer": "http://localhost:3000/"
      }
    });
    console.log("Fetch with Referer (http://localhost:3000/) Status:", res.status);
    const body = await res.text();
    if (res.status === 403) {
      console.log("Response Snippet:", body.substring(0, 300));
    }
  } catch (err: any) {
    console.error("Fetch with referer failed:", err.message);
  }
}

run();
