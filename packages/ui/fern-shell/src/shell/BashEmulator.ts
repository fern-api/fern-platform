import { IDisposable, ITerminalAddon, Terminal } from "@xterm/xterm";
import chalk from "chalk";
import { TeletypeController } from "./TeletypeController";
import { routes } from "./commands/routes";
import { CommandHandler } from "./commands/types";
import { parseArgv } from "./parseArgv";

export class BashEmulator implements ITerminalAddon {
    #terminal?: Terminal;
    #commands = new Map<string, CommandHandler>();
    #disposeables = new Set<IDisposable>();
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
        this.#disposeables.forEach((disposable) => disposable.dispose());
        this.#disposeables.clear();
    }

    mount() {
        this.tty?.mount();
    }

    addCommand(command: string, handler: CommandHandler): void {
        this.#commands.set(command, handler);
        if (handler.completions) {
            const disposable = this.tty?.onTab(handler.completions);
            if (disposable) {
                this.#disposeables.add(disposable);
            }
        }
    }

    removeCommand(command: string): void {
        this.#commands.delete(command);
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
            this.#terminal?.write(chalk.gray(`command not found: ${command} \r\n`));
            return 127;
        }

        const stdoutWriter = {
            write: (data: string) => {
                this.#terminal?.write(data.replace(/(?<!\r)\n/g, "\r\n"));
            },
        };

        const stderrWriter = {
            write: (data: string) => {
                this.#terminal?.write(chalk.gray(data.replace(/(?<!\r)\n/g, "\r\n")));
            },
        };

        console.log("Running command:", command, argv);
        return fn
            .handler({
                argv,
                stdout: stdoutWriter,
                stderr: stderrWriter,
                env: this.env,
            })
            .catch((error) => {
                console.error("Command execution error:", error);
                return 1; // Non-zero exit code on error
            });
    }
}
