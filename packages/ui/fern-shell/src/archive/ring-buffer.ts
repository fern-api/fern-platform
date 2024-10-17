export interface RingBuffer<T, R = T> {
    push(item: T): void;
    next(): R | undefined;
    prev(): R | undefined;
    last(): R | undefined;
    rewind(): void;
    clear(): void;
    size: number;
    entries: readonly T[];
}

export class RingBufferImpl<T> implements RingBuffer<T> {
    private buffer: T[] = [];
    private cursor = 0;

    constructor(private readonly maxSize: number) {}

    clear(): void {
        this.buffer = [];
        this.cursor = 0;
    }

    last(): T | undefined {
        return this.buffer[this.buffer.length - 1];
    }

    get size() {
        return this.buffer.length;
    }

    push(item: T): void {
        this.buffer.push(item);
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }

    next(): T | undefined {
        if (this.cursor >= this.buffer.length) {
            return undefined;
        }
        this.cursor = Math.min(this.cursor + 1, this.buffer.length - 1);
        return this.buffer[this.cursor];
    }

    prev(): T | undefined {
        this.cursor = Math.max(0, this.cursor - 1);
        return this.buffer[this.cursor];
    }

    rewind(): void {
        this.cursor = this.buffer.length;
    }

    get entries() {
        return this.buffer;
    }
}
