import { Writer } from "../utils/Writer";

export class Block {
    public id: string;
    public content: string;

    constructor({ id, content }: { id: string; content: string }) {
        this.id = id;
        this.content = content;
    }

    public write(writer: Writer): void {
        writer.write(this.content);
        if (!this.content.endsWith("\n")) {
            writer.writeLine();
        }
    }
}
