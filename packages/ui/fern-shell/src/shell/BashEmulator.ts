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
        const argv = parseArgv(input);
        const command = argv[0];
        if (!command) {
            this.env.set("?", "0");
            return;
        }
        const exitCode = await this.#handleRunCommand(command, argv);
        this.env.set("?", String(exitCode));
    }

    async #handleRunCommand(command: string, argv: string[]): Promise<number> {
        const fn = this.#commands.get(command);

        if (!fn) {
            this.#terminal?.write(`${command}: command not found\r\n`);
            return 127;
        }

        const writer = {
            write: (data: string) => {
                this.#terminal?.write(data.replace(/(?<!\r)\n/g, "\r\n"));
            },
        };

        console.log("Running command:", command, argv);
        return fn({
            argv,
            stdout: writer,
            stderr: writer,
            env: this.env,
        }).catch((error) => {
            console.error("Command execution error:", error);
            return 1; // Non-zero exit code on error
        });
    }
}
