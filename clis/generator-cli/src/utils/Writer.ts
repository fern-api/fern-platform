import fs from "fs";

export abstract class Writer {
  public writeCodeBlock(language: string, content: string): void {
    this.writeLine("```" + language);
    this.write(content);
    this.writeLine("```");
  }

  public writeLine(content?: string): void {
    if (content === undefined) {
      this.write("\n");
    } else {
      this.write(`${content}\n`);
    }
  }

  public abstract write(content: string): void;
  public abstract end(): void;
}

export class StreamWriter extends Writer {
  constructor(private stream: fs.WriteStream) {
    super();
    this.stream = stream;
  }

  public write(content: string): void {
    this.stream.write(content);
  }

  public end(): void {
    this.stream.end();
  }
}

export class StringWriter extends Writer {
  private content: string;

  constructor() {
    super();
    this.content = "";
  }

  public write(content: string): void {
    this.content += content;
  }

  public end(): void {
    return;
  }

  public toString(): string {
    return this.content;
  }
}
