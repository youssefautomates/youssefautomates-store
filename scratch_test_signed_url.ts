import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  const libraryId = process.env.BUNNY_LIBRARY_ID || "";
  const testVideoId = "62cea704-3025-49b6-99a9-61f97a9a3ae3";
  const unsignedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${testVideoId}`;
  console.log("Fetching unsigned url:", unsignedUrl);

  try {
    const res = await fetch(unsignedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "http://localhost:3000/"
      }
    });
    console.log("Status Code:", res.status);
    const text = await res.text();
    console.log("Snippet of response:");
    console.log(text.substring(0, 500));
  } catch (e: any) {
    console.error("Fetch error:", e.message);
  }
}

run();
