import { ITerminalAddon, Terminal } from "@xterm/xterm";
import { TeletypeController } from "./TeletypeController";
import { routes } from "./commands/routes";
import { CommandProps } from "./commands/types";
import { parseArgv } from "./parseArgv";

export class BashEmulator implements ITerminalAddon {
    #terminal?: Terminal;
    #commands = new Map<string, (props: CommandProps) => Promise<number>>();
    #completions = new Map<string, (argv: string[]) => Promise<string[]>>();
    tty?: TeletypeController;

    constructor() {}

    activate(terminal: Terminal): void {
        this.#terminal = terminal;
        this.tty = new TeletypeController();
        this.tty.activate(terminal);

        this.tty.onCarriageReturn(this.#handleCarriageReturn.bind(this));

        Object.entries(routes).forEach(([command, handler]) => {
            this.addCommand(command, handler);
        });
    }

    dispose(): void {
        this.#terminal = undefined;
        this.tty?.dispose();
        this.tty = undefined;
        this.#commands.clear();
        this.#completions.clear();
    }

    mount() {
        this.tty?.mount();
    }

    addCommand(command: string, fn: (props: CommandProps) => Promise<number>): void {
        this.#commands.set(command, fn);
    }

    removeCommand(command: string): void {
        this.#commands.delete(command);
    }

    addCompletion(command: string, fn: (argv: string[]) => Promise<string[]>): void {
        this.#completions.set(command, fn);
    }

    removeCompletion(command: string): void {
        this.#completions.delete(command);
    }

    env = new Map<string, string>([["?", "0"]]);

    async #handleCarriageReturn(input: string): Promise<void> {
        const pipes = splitPipes(parseArgv(input));
        let lastStdout: ReadableStream<string> | undefined;
        const exits: Promise<number>[] = [];
        for (let i = 0; i < pipes.length; i++) {
            const argv = pipes[i];
            const command = argv[0];
            if (command != null && command.length > 0) {
                const [exitPromise, stdout] = this.#handleRunCommand(command, argv, lastStdout, i === pipes.length - 1);
                lastStdout = stdout;

                exits.push(exitPromise);
            } else {
                exits.push(Promise.resolve(0));
            }
        }

        const results = await Promise.all(exits);
        const exitCode = results.reduce((acc, curr) => (curr === 0 ? acc : curr), 0);
        this.env.set("?", exitCode.toString());
    }

    #handleRunCommand(
        command: string,
        argv: string[],
        stdin?: ReadableStream<string>,
        writeToTerminal: boolean = false,
    ): [exit: Promise<number>, stdout: ReadableStream<string>] {
        const fn = this.#commands.get(command);

        const stdout = new TransformStream<string, string>({
            transform: (chunk, controller) => {
                controller.enqueue(chunk);
                if (writeToTerminal) {
                    this.#terminal?.write(chunk.replace(/(?<!\r)\n/g, "\r\n"));
                }
            },
        });

        const stderr = new WritableStream<string>({
            write: (chunk) => {
                console.log("stderr", chunk);

                if (writeToTerminal) {
                    this.#terminal?.write(chunk.replace(/(?<!\r)\n/g, "\r\n"));
                }
            },
        });

        stdin ??= new ReadableStream<string>({
            start(controller) {
                controller.close();
            },
        });

        const stderrWriter = stderr.getWriter();
        if (!fn) {
            stderrWriter
                .write(`${command}: command not found\r\n`)
                .then(() => {
                    stderrWriter.close();
                    stdout.writable.close();
                    stdin.cancel();
                })
                .finally(() => {
                    stderrWriter.releaseLock();
                });
            return [Promise.resolve(127), stdout.readable];
        }

        const stdoutWriter = stdout.writable.getWriter();
        const stdinReader = stdin.getReader();
        return [
            fn({
                argv,
                stdout: stdoutWriter,
                stderr: stderrWriter,
                stdin: stdinReader,
                env: this.env,
            })
                .then((exit) => {
                    stdoutWriter.close();
                    stderrWriter.close();
                    stdinReader.cancel();
                    return exit;
                })
                .finally(() => {
                    stdoutWriter.releaseLock();
                    stderrWriter.releaseLock();
                    stdinReader.releaseLock();
                }),
            stdout.readable,
        ];
    }
}

function splitPipes(argv: string[]): string[][] {
    const pipes: string[][] = [];
    let current: string[] = [];
    for (const arg of argv) {
        if (arg === "|") {
            pipes.push(current);
            current = [];
        } else {
            current.push(arg);
        }
    }
    pipes.push(current);
    return pipes.filter((pipe) => pipe.length > 0);
}
