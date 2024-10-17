export interface CommandProps {
    argv: string[];
    stdout: WritableStreamDefaultWriter<string>;
    stderr: WritableStreamDefaultWriter<string>;
    stdin: ReadableStreamDefaultReader<string>;
    env: Map<string, string>;
}

export interface CommandHandler {
    (props: CommandProps): Promise<number>;
}
