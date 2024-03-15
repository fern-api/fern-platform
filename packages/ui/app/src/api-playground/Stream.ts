export class Stream implements AsyncIterable<string> {
    private stream: ReadableStream;
    private terminator: string;

    constructor({ stream, terminator }: { stream: ReadableStream; terminator: string }) {
        this.stream = stream;
        this.terminator = terminator;
    }

    private async *iterMessages(): AsyncGenerator<string, void> {
        let previous = "";
        const reader = this.stream.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const bufferChunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
            previous += bufferChunk;
            let terminatorIndex: number;

            while ((terminatorIndex = previous.indexOf(this.terminator)) >= 0) {
                const line = previous.slice(0, terminatorIndex).trimEnd();
                yield line;
                previous = previous.slice(terminatorIndex + 1);
            }
        }
    }

    async *[Symbol.asyncIterator](): AsyncIterator<string, void, unknown> {
        for await (const message of this.iterMessages()) {
            yield message;
        }
    }
}
