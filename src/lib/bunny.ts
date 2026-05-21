import crypto from "crypto";
import https from "https";

const libraryId = process.env.BUNNY_LIBRARY_ID || "";
const apiKey = process.env.BUNNY_API_KEY || "";
const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || "";

export interface BunnyVideoStatus {
  guid: string;
  title: string;
  status: number; // 0: Queued, 1: Processing, 2: Encoding Failed, 3: Playable/Ready, 4: Uploading
  encodeProgress: number;
  length: number; // duration in seconds
  thumbnailUrl: string;
  hasMP4Fallback: boolean;
}

/**
 * Robust helper to send HTTPS requests directly to Bunny Stream API.
 * Includes automatic retry with exponential backoff to handle DNS choking/network drops
 * (e.g., when multiple parallel uploads saturate bandwidth and DNS lookups fail with ENOTFOUND).
 */
function bunnyRequest(
  path: string,
  method: string,
  body?: any,
  retries = 3,
  delay = 1000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const attempt = (remaining: number) => {
      const bodyString = body ? JSON.stringify(body) : undefined;
      const options = {
        hostname: "video.bunnycdn.com",
        path: path,
        method: method,
        timeout: 12000, // 12 seconds request timeout
        headers: {
          "AccessKey": apiKey,
          "Accept": "application/json",
          ...(bodyString ? {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyString)
          } : {}),
        }
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(data ? JSON.parse(data) : {});
            } catch (e) {
              resolve(data);
            }
          } else {
            // If it's a 5xx server-side error on Bunny, we can retry
            if (res.statusCode && res.statusCode >= 500 && remaining > 0) {
              console.warn(`[BUNNY_API_RETRY] Bunny returned status ${res.statusCode}. Retrying in ${delay}ms... (${remaining} retries left)`);
              setTimeout(() => attempt(remaining - 1), delay);
            } else {
              reject(new Error(`Bunny API error: ${res.statusCode} - ${data}`));
            }
          }
        });
      });

      req.on("timeout", () => {
        req.destroy();
      });

      req.on("error", (err: any) => {
        const isNetworkOrDnsError = 
          err.code === "ENOTFOUND" || 
          err.code === "ETIMEOUT" || 
          err.code === "ECONNRESET" || 
          err.code === "EADDRINUSE" || 
          err.code === "ESOCKETTIMEDOUT";

        if (isNetworkOrDnsError && remaining > 0) {
          console.warn(`[BUNNY_API_RETRY] Network/DNS error (${err.code || err.message}). Retrying in ${delay}ms... (${remaining} retries left)`);
          // Exponential backoff
          setTimeout(() => attempt(remaining - 1), delay * 2);
        } else {
          reject(err);
        }
      });

      if (bodyString) {
        req.write(bodyString);
      }
      req.end();
    };

    attempt(retries);
  });
}

/**
 * Creates a video placeholder on Bunny Stream and returns its unique GUID (video_id).
 */
export async function createVideoPlaceholder(title: string): Promise<string> {
  if (!libraryId || !apiKey) {
    throw new Error("إعدادات Bunny Stream مفقودة. تأكد من وجود BUNNY_LIBRARY_ID و BUNNY_API_KEY في ملف .env.local");
  }

  const path = `/library/${libraryId}/videos`;
  console.log(`[BUNNY_CREATE_VIDEO] POST https://video.bunnycdn.com${path} | title="${title}"`);
  
  try {
    const data = await bunnyRequest(path, "POST", { title });
    console.log(`[BUNNY_CREATE_VIDEO] Success: guid=${data.guid}`);
    if (!data.guid) {
      throw new Error(`استجابة Bunny API لا تحتوي على guid. الاستجابة: ${JSON.stringify(data)}`);
    }
    return data.guid;
  } catch (err: any) {
    console.error(`[BUNNY_CREATE_VIDEO] Failed:`, err.message);
    throw err;
  }
}

/**
 * Deletes a video from Bunny Stream.
 */
export async function deleteVideoFromBunny(videoId: string): Promise<void> {
  if (!libraryId || !apiKey) return;

  const path = `/library/${libraryId}/videos/${videoId}`;
  try {
    await bunnyRequest(path, "DELETE");
  } catch (err: any) {
    // Ignore 404 errors as the video might already be deleted
    if (!err.message.includes("404")) {
      console.error(`[BUNNY_STREAM_DELETE_ERROR] Failed to delete video ${videoId}:`, err);
    }
  }
}

/**
 * Retrieves the status and details of a video from Bunny Stream.
 */
export async function getVideoStatusFromBunny(videoId: string): Promise<BunnyVideoStatus> {
  if (!libraryId || !apiKey) {
    throw new Error("Bunny library credentials are not configured.");
  }

  const path = `/library/${libraryId}/videos/${videoId}`;
  const data = await bunnyRequest(path, "GET");
  
  // Construct standard thumbnail url from Bunny
  // Default format: https://video.bunnycdn.com/play/{libraryId}/{videoId}/thumbnail.jpg
  const fallbackThumb = `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}/thumbnail.jpg`;

  return {
    guid: data.guid,
    title: data.title,
    status: data.status,
    encodeProgress: data.encodeProgress,
    length: data.length || 0,
    thumbnailUrl: data.thumbnailUrl || fallbackThumb,
    hasMP4Fallback: data.hasMP4Fallback || false,
  };
}

/**
 * Generates a signed embed URL for secure iframe playback.
 */
export function generateSignedEmbedUrl(videoId: string, expirationMinutes = 120): string {
  if (!libraryId || !tokenKey) {
    throw new Error("Bunny token key configuration is missing.");
  }

  const expiration = Math.floor(Date.now() / 1000) + expirationMinutes * 60;
  
  // Signature: SHA256(tokenKey + videoId + expiration)
  const signature = crypto
    .createHash("sha256")
    .update(tokenKey + videoId + expiration.toString())
    .digest("hex");

  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${signature}&expires=${expiration}&preload=true&responsive=true&autoplay=false`;
}

/**
 * Generates a signed HLS stream URL (playlist.m3u8) for direct play in custom players.
 */
export function generateSignedHlsUrl(videoId: string, expirationMinutes = 120): string {
  if (!libraryId || !tokenKey) {
    throw new Error("Bunny token key configuration is missing.");
  }

  const expiration = Math.floor(Date.now() / 1000) + expirationMinutes * 60;

  // Signature: SHA256(tokenKey + videoId + expiration)
  const signature = crypto
    .createHash("sha256")
    .update(tokenKey + videoId + expiration.toString())
    .digest("hex");

  return `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}/playlist.m3u8?token=${signature}&expires=${expiration}`;
}
