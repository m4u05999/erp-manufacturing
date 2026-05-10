import Redis from "ioredis";

const url = process.env.REDIS_URL || "redis://localhost:6379";

let client: Redis | null = null;

function getClient() {
  if (!client) {
    client = new Redis(url);
    client.on("error", (err) => console.error("Valkey error:", err));
  }
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await getClient().get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300) {
  try {
    await getClient().setex(key, ttlSeconds, JSON.stringify(value));
  } catch {}
}

export async function cacheDel(key: string) {
  try {
    await getClient().del(key);
  } catch {}
}
