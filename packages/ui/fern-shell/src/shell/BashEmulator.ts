import { ITerminalAddon, Terminal } from "@xterm/xterm";
import stringArgv from "string-argv";
import { TeletypeController } from "./TeletypeController";
import { routes } from "./commands/routes";
import { CommandProps, Writer } from "./commands/types";

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
        const [command, ...argv] = stringArgv(input);
        if (command != null && command.length > 0) {
            // TODO: handle piping
            const [exit, _output, env] = await this.#handleRunCommand(command, argv);
            this.env = env; // what if this is a subshell?
            this.env.set("?", exit.toString());
        } else {
            this.env.set("?", "0");
        }
    }

    async #handleRunCommand(command: string, argv: string[]): Promise<[number, string, Map<string, string>]> {
        const fn = this.#commands.get(command);
        const env = new Map(this.env);

        let outBuffer = "";

        const stdout: Writer = {
            write: (chunk: string | Uint8Array) => {
                return new Promise((resolve) => {
                    this.#terminal?.write(chunk, () => {
                        outBuffer += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
                        resolve();
                    });
                });
            },
        };

        const stderr: Writer = {
            write: (chunk: string | Uint8Array) => {
                return new Promise((resolve) => {
                    this.#terminal?.write(chunk, () => {
                        outBuffer += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
                        resolve();
                    });
                });
            },
        };

        if (!fn) {
            stderr.write(`${command}: command not found\r\n`);
            return Promise.resolve([127, "", env]);
        }

        const exit = await fn({ argv, stdout, stderr, env });
        return [exit, outBuffer, env];
    }

    // UTILITIES

    // #handleBackspace(e: KeyboardEvent): void {
    //     if (!this.#terminal) {
    //         return;
    //     }
    //     this.#terminal.deleteLeft();
    // }

    // #handleArrowUp(e: KeyboardEvent): void {
    //     if (!this.#terminal) {
    //         return;
    //     }
    //     this.#terminal.deleteLeft();
    // }

    // #handleWindowKeyDown(e: KeyboardEvent): void {
    //     if (!this.#terminal) {
    //         return;
    //     }
    //     if (document.activeElement !== this.#terminal.textarea) {
    //         return;
    //     }
    //     if (!e.metaKey) {
    //         return;
    //     }
    //     if (e.key === "ArrowLeft") {
    //         // move cursor left;
    //     }
    //     if (e.key === "ArrowRight") {
    //         // move cursor right;
    //     }
    // }
}

// type CommandSegment =
//     | ExecCommandSegment
//     | PipeCommandSegment
//     | AndCommandSegment
//     | OrCommandSegment
//     | SequenceCommandSegment
//     | SubshellCommandSegment
//     | BackgroundCommandSegment
//     | BraceCommandSegment;

// interface ExecCommandSegment {
//     type: "exec";
//     command: string;
//     argv: string[];
// }

// interface PipeCommandSegment {
//     type: "pipe";
//     commands: [CommandSegment, CommandSegment];
// }

// interface AndCommandSegment {
//     type: "and";
//     commands: [CommandSegment, CommandSegment];
// }

// interface OrCommandSegment {
//     type: "or";
//     commands: [CommandSegment, CommandSegment];
// }

// interface SequenceCommandSegment {
//     type: "sequence";
//     commands: [CommandSegment, CommandSegment];
// }

// interface SubshellCommandSegment {
//     type: "subshell";
//     commands: CommandSegment[];
// }

// interface BackgroundCommandSegment {
//     type: "background";
//     command: CommandSegment;
// }

// interface BraceCommandSegment {
//     type: "group";
//     commands: CommandSegment[];
// }

// class ParseError extends Error {
//     constructor(arg: string) {
//         super(`parse error near '${arg}'`);
//     }
// }

// class EndOfInputError extends Error {
//     constructor() {
//         super("unexpected end of input");
//     }
// }

// function parseCommand(argv: string[]): [CommandSegment | undefined, string[]] {
//     // if (argv.length === 0 || argv[0] == null) {
//     //     return [undefined, []];
//     // }

//     // let args = [...argv];

//     // let segment: CommandSegment | undefined;

//     // while (args.length > 0) {
//     //     const arg = args.shift();
//     //     if (arg == null) {
//     //         break;
//     //     }

//     //     if (arg === "") {
//     //         continue;
//     //     }

//     //     if (arg === "&&") {
//     //         if (segment == null) {
//     //             throw new ParseError(arg);
//     //         }
//     //         const [right, rest] = parseCommand(args);
//     //         if (right == null) {
//     //             throw new EndOfInputError();
//     //         }
//     //         args = rest;
//     //         segment = {
//     //             type: "and",
//     //             commands: [segment, right],
//     //         };
//     //     } else if (arg === "||") {
//     //         if (segment == null) {
//     //             throw new ParseError(arg);
//     //         }
//     //         const [right, rest] = parseCommand(args);
//     //         if (right == null) {
//     //             throw new EndOfInputError();
//     //         }
//     //         args = rest;
//     //         segment = {
//     //             type: "or",
//     //             commands: [segment, right],
//     //         };
//     //     } else if (arg === ";") {
//     //         const [right, rest] = parseCommand(args);
//     //         if (right == null) {
//     //             throw new ParseError("unexpected end of input");
//     //         }
//     //         args = rest;
//     //         if (segment == null) {
//     //             segment = right;
//     //         } else if (segment.type === "sequence") {
//     //             segment.commands.push(right);
//     //         } else {
//     //             segment = {
//     //                 type: "sequence",
//     //                 commands: [segment, right],
//     //             };
//     //         }
//     //     } else if (arg === "&") {
//     //         if (segment == null) {
//     //             throw new ParseError(arg);
//     //         }
//     //         const [right, rest] = parseCommand(args);
//     //         if (right == null) {
//     //             throw new EndOfInputError();
//     //         }
//     //         args = rest;
//     //         segment = {
//     //             type: "background",
//     //             command: segment,
//     //         };
//     //     } else if (arg === "(") {
//     //         // find the matching )
//     //         let depth = 0;
//     //         let subargs: string[] = [];
//     //         for (let i = 0; i < args.length; i++) {
//     //             if (args[i] === "(") {
//     //                 depth++;
//     //             } else if (args[i] === ")") {
//     //                 depth--;
//     //                 if (depth === 0) {
//     //                     break;
//     //                 }
//     //             }
//     //             subargs.push(args[i]);
//     //         }
//     //         args = args.slice(subargs.length);
//     //         if (depth !== 0) {
//     //             throw new EndOfInputError();
//     //         }
//     //         if (segment == null) {
//     //             segment = {
//     //                 type: "group",
//     //                 commands: [],
//     //             };
//     //         } else if (segment.type !== "group") {
//     //             segment = {
//     //                 type: "group",
//     //                 commands: [segment],
//     //             };
//     //         }
//     //         while (subargs.length > 0) {
//     //             const [subcommand, rest] = parseCommand(subargs);
//     //             subargs = rest;
//     //             if (subcommand == null) {
//     //                 continue;
//     //             }
//     //             if (segment == null) {
//     //                 segment = subcommand;
//     //             } else if (segment.type === "group") {
//     //                 segment.commands.push(subcommand);
//     //             } else {
//     //                 throw new ParseError(arg);
//     //             }
//     //         }
//     //     } else if (arg === ")") {
//     // }

//     // return [undefined, []];
// }
