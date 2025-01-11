export class Stream<T> implements AsyncIterable<T> {
  private stream: ReadableStream;
  private parse: (val: unknown) => Promise<T>;
  private terminator: string;

  constructor({
    stream,
    parse,
    terminator,
  }: {
    stream: ReadableStream;
    parse: (val: unknown) => Promise<T>;
    terminator: string;
  }) {
    this.stream = stream;
    this.parse = parse;
    this.terminator = terminator;
  }

  private async *iterMessages(): AsyncGenerator<T, void> {
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
        const line = previous.slice(0, terminatorIndex).trim();
        if (line.length > 0) {
          const message = await this.parse(line);
          yield message;
        }
        previous = previous.slice(terminatorIndex + this.terminator.length);
      }
    }
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T, void, unknown> {
    for await (const message of this.iterMessages()) {
      yield message;
    }
  }
}
