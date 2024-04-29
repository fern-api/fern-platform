export class Cache<V> {
    private readonly cache: Record<string, { value: V; timestamp: number }> = {};
    private keysQueue: string[] = [];

    public constructor(
        private readonly maxKeys: number,
        private readonly ttl?: number /* in seconds */,
    ) {}

    public get(key: string): V | undefined {
        const item = this.cache[key];
        if (item != null) {
            if (this.ttl == null || this.ttl < 0) {
                return item.value;
            }

            const now = Date.now();
            if (now - item.timestamp < this.ttl * 1000) {
                return item.value;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.cache[key];
                this.keysQueue = this.keysQueue.slice(this.keysQueue.indexOf(key));
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
        this.keysQueue = this.keysQueue.filter((k) => k !== key);
        this.keysQueue.push(key);
    }

    private deleteOldestKeys(): void {
        while (this.keysQueue.length > this.maxKeys) {
            const key = this.keysQueue.shift();
            if (key != null && this.cache[key] != null) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.cache[key];
            }
        }
    }
}
