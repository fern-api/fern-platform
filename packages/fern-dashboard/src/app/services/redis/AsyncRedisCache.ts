import { RedisCacheKey, RedisCacheKeyType, inferCachedData } from "./cacheKey";
import { redisDel, redisGet, redisSet } from "./redis";

export class AsyncRedisCache<T extends RedisCacheKeyType> {
  private debug: boolean;
  private ttlInSeconds: number;

  constructor(
    private readonly type: T,
    { ttlInSeconds, debug = false }: { ttlInSeconds: number; debug?: boolean }
  ) {
    this.ttlInSeconds = ttlInSeconds;
    this.debug = debug;
  }

  public async get(
    key: RedisCacheKey<T>,
    getter: () => Promise<inferCachedData<T>>
  ): Promise<inferCachedData<T>> {
    const log = this.debug
      ? (logLine: string) =>
          console.debug(`[${this.type} CACHE] key=${key} ${logLine}`)
      : undefined;

    log?.("checking cache");

    const cachedValue = await redisGet(key);
    if (cachedValue != null) {
      log?.("cache hit, returning value");
      return cachedValue;
    }

    log?.("cache miss, getting value");
    const newValue = await getter();

    log?.("updating cache");
    await redisSet(key, newValue, {
      ttlInSeconds: this.ttlInSeconds,
    });

    log?.("returning value");
    return newValue;
  }

  public async invalidate(key: RedisCacheKey<T>) {
    await redisDel(key);
  }
}
