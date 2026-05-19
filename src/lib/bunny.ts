import crypto from "crypto";

const libraryId = process.env.BUNNY_LIBRARY_ID || "";
const apiKey = process.env.BUNNY_API_KEY || "";
const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || "";

const BASE_URL = "https://video.bunnycdn.com";

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
 * Creates a video placeholder on Bunny Stream and returns its unique GUID (video_id).
 */
export async function createVideoPlaceholder(title: string): Promise<string> {
  if (!libraryId || !apiKey) {
    throw new Error("Bunny library credentials are not configured in environment variables.");
  }

  const url = `${BASE_URL}/library/${libraryId}/videos`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create video placeholder on Bunny Stream: ${errorText}`);
  }

  const data = await res.json();
  return data.guid;
}

/**
 * Deletes a video from Bunny Stream.
 */
export async function deleteVideoFromBunny(videoId: string): Promise<void> {
  if (!libraryId || !apiKey) return;

  const url = `${BASE_URL}/library/${libraryId}/videos/${videoId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      AccessKey: apiKey,
    },
  });

  if (!res.ok && res.status !== 404) {
    const errorText = await res.text();
    console.error(`[BUNNY_STREAM_DELETE_ERROR] Failed to delete video ${videoId}: ${errorText}`);
  }
}

/**
 * Retrieves the status and details of a video from Bunny Stream.
 */
export async function getVideoStatusFromBunny(videoId: string): Promise<BunnyVideoStatus> {
  if (!libraryId || !apiKey) {
    throw new Error("Bunny library credentials are not configured.");
  }

  const url = `${BASE_URL}/library/${libraryId}/videos/${videoId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      AccessKey: apiKey,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch Bunny video status: ${errorText}`);
  }

  const data = await res.json();
  
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

  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${signature}&expires=${expiration}`;
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
