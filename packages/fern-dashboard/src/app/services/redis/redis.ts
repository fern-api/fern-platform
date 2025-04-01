import { Redis } from "@upstash/redis";

import { RedisCacheKey, RedisCacheKeyType, inferCachedData } from "./cacheKey";

let redis: Redis | undefined;

export function getRedisClient() {
  if (redis == null) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return redis;
}

export async function redisSet<T extends RedisCacheKeyType>(
  key: RedisCacheKey<T>,
  value: inferCachedData<T>,
  { ttlInSeconds }: { ttlInSeconds: number }
) {
  await getRedisClient().set<inferCachedData<T>>(key, value, {
    ex: ttlInSeconds,
  });
}

export async function redisGet<T extends RedisCacheKeyType>(
  key: RedisCacheKey<T>
): Promise<inferCachedData<T> | undefined> {
  const value = await getRedisClient().get<inferCachedData<T>>(key);
  return value ?? undefined;
}

export async function redisDel<T extends RedisCacheKeyType>(
  key: RedisCacheKey<T>
) {
  await getRedisClient().del(key);
}
