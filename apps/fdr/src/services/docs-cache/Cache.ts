import NodeCache, { Options } from "node-cache";

export class Cache<_K = string, V = void> {
    private cache;

    public constructor(options: Options) {
        this.cache = new NodeCache(options);
    }

    public get(key: string): V | undefined {
        const value = this.cache.get(key);
        if (value == null) {
            return undefined;
        }
        return value as V;
    }

    public set(key: string, value: V) {
        this.cache.set(key, value);
    }

    public remove(key: string) {
        this.cache.del(key);
    }

    public entries(): Record<string, V> {
        const result: Record<string, V> = {};
        for (const key of this.cache.keys()) {
            const value = this.get(key);
            if (value != null) {
                result[key] = value;
            }
        }
        return result;
    }
}
