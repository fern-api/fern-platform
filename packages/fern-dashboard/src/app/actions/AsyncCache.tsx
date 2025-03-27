import NodeCache from "node-cache";

export class AsyncCache<K extends NodeCache.Key, T> {
  private cache: NodeCache;

  constructor({ ttlInSeconds }: { ttlInSeconds: number }) {
    this.cache = new NodeCache({ stdTTL: ttlInSeconds });
  }

  public async get(key: K, getter: () => T | Promise<T>): Promise<T> {
    const cachedValue = this.cache.get<T>(key);
    if (cachedValue != null) {
      return cachedValue;
    }
    const newValue = await getter();
    this.cache.set(key, newValue);
    return newValue;
  }
}
