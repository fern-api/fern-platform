import { RingBuffer, RingBufferImpl } from "./ring-buffer";

type Command = string;

interface HistoryEntry {
    command: Command;
    timestamp: number;
}

/**
 * The shell history provides a ring-buffer of commands that the user has entered.
 * It also provides methods to search through the history.
 */
export default class ShellHistory implements RingBuffer<Command, HistoryEntry> {
    private ringBuffer: RingBufferImpl<HistoryEntry>;

    constructor(readonly maxSize: number) {
        this.ringBuffer = new RingBufferImpl(maxSize);
    }

    clear(): void {
        this.ringBuffer.clear();
    }

    rewind(): void {
        this.ringBuffer.rewind();
    }

    get entries(): readonly Command[] {
        return this.ringBuffer.entries.map((e) => e.command);
    }

    last(): HistoryEntry | undefined {
        return this.ringBuffer.last();
    }

    get size() {
        return this.ringBuffer.size;
    }

    next(): HistoryEntry | undefined {
        return this.ringBuffer.next();
    }
    prev(): HistoryEntry | undefined {
        return this.ringBuffer.prev();
    }
    has(item: string): boolean {
        return this.ringBuffer.entries.some((e) => e.command === item);
    }

    /**
     * Push an entry and maintain ring buffer size
     */
    push(entry: string) {
        // Skip empty entries
        if (entry.trim() === "") {
            return;
        }
        // Skip duplicate entries
        const lastEntry = this.entries[this.entries.length - 1];
        if (entry === lastEntry) {
            return;
        }
        // Keep track of entries
        this.ringBuffer.push({ command: entry, timestamp: Date.now() });
    }

    /**
     * Check if the history includes an entry
     */
    includes(entry: string): boolean {
        return this.entries.includes(entry);
    }
}
