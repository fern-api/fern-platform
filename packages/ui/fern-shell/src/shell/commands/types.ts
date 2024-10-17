interface Writer {
    write: (data: string) => void;
}

export interface CommandProps {
    argv: string[];
    stdout: Writer;
    stderr: Writer;
    env: Map<string, string>;
}

export interface CommandHandler {
    (props: CommandProps): Promise<number>;
}
