import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function check() {
  const { getVideoStatusFromBunny } = await import("./src/lib/bunny");
  const videoIds = [
    "62cea704-3025-49b6-99a9-61f97a9a3ae3",
    "e350fce2-0258-4c4a-b404-a1567b7cf88a",
    "0ee1aa79-ff49-4f3e-b223-fcbeba26ffbe"
  ];

  for (const id of videoIds) {
    try {
      const status = await getVideoStatusFromBunny(id);
      console.log(`Video ID: ${id}`);
      console.log(status);
    } catch (e: any) {
      console.error(`Error for video ID ${id}:`, e.message);
    }
  }
}

check();
