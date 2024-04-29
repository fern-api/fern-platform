export class Cache<V> {
    private readonly cache: Record<string, V> = {};

    public constructor(private readonly maxKeys: number) {}

    public get(key: string): V | undefined {
        return this.cache[key];
    }

    public set(key: string, value: V): void {
        if (Object.keys(this.cache).length >= this.maxKeys) {
            const keyToDelete = Object.keys(this.cache)[0];
            if (keyToDelete != null) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.cache[keyToDelete];
            }
        }
        this.cache[key] = value;
    }
}
