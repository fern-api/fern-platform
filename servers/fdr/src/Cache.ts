const MILLIS_IN_SECOND = 1000;

export class Cache<V> {
  private readonly cache: Record<string, { value: V; timestamp: number }> = {};

  // keysQueue is used to keep track of the order in which keys were added to the cache
  private keysQueue: string[] = [];

  public constructor(
    private readonly maxKeys: number,
    private readonly ttl?: number /* in seconds */
  ) {}

  public get(key: string): V | undefined {
    const item = this.cache[key];
    if (item != null) {
      // if ttl is not set, or if it is set to a negative value, then return the value
      if (this.ttl == null || this.ttl < 0) {
        return item.value;
      }

      const now = Date.now();
      if (now - item.timestamp < this.ttl * MILLIS_IN_SECOND) {
        return item.value;
      } else {
        // remove the key from the queue and all keys before it
        const index = this.keysQueue.indexOf(key);
        this.deleteIndex(index);
      }
    }
    return undefined;
  }

  public set(key: string, value: V): void {
    this.deleteOldestKeys();

    this.cache[key] = {
      value,
      timestamp: Date.now(),
    };

    // move the key to the end of the queue
    this.keysQueue = this.keysQueue.filter((k) => k !== key);
    this.keysQueue.push(key);
  }

  private deleteOldestKeys(): void {
    // remove the oldest keys if the cache is full, and makes space for a new key
    while (this.keysQueue.length > this.maxKeys - 1) {
      const key = this.keysQueue.shift();
      if (key == null) {
        // this should never happen
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.cache[key];
    }

    const ttl = this.ttl;
    if (ttl == null) {
      return;
    }

    // remove all keys that have expired
    const index = this.keysQueue.findIndex((key) => {
      const item = this.cache[key];
      if (item == null) {
        return false;
      }
      return Date.now() - item.timestamp >= ttl * MILLIS_IN_SECOND;
    });

    if (index < 1) {
      return;
    }
    this.deleteIndex(index - 1);
  }

  private deleteIndex(index: number): void {
    if (index < 0) {
      return;
    }
    const keysToDelete = this.keysQueue.slice(0, index);
    this.keysQueue = this.keysQueue.slice(index);

    for (const key of keysToDelete) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.cache[key];
    }
  }
}
