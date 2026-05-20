import dotenv from "dotenv";
import path from "path";

async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/video/showcase?videoId=62cea704-3025-49b6-99a9-61f97a9a3ae3");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", data);
  } catch (e: any) {
    console.error("Fetch error:", e.message);
  }
}

run();
