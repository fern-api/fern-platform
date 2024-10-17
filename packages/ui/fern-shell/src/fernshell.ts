import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { IDisposable, ITerminalInitOnlyOptions, ITerminalOptions, Terminal } from "@xterm/xterm";
import ansi from "ansi-escapes";
import ShellHistory from "./archive/history";

type KeyEvent = {
    key: string;
    domEvent: KeyboardEvent;
};

export class FernShell extends Terminal {
    #resizeObserver: ResizeObserver;
    #fitAddon: FitAddon;
    #history = new ShellHistory(100);

    constructor(options?: ITerminalOptions & ITerminalInitOnlyOptions) {
        super(options);

        const weblinksAddon = new WebLinksAddon();
        this.loadAddon(weblinksAddon);

        this.#fitAddon = new FitAddon();
        this.loadAddon(this.#fitAddon);

        this.#resizeObserver = new ResizeObserver(() => {
            this.#fitAddon.fit();
        });
    }

    public fit() {
        this.#fitAddon.fit();
    }

    public dispose() {
        window.removeEventListener("keydown", this.#handleWindowKeyDown.bind(this), { capture: true });
        this.#resizeObserver.disconnect();
        super.dispose();
    }

    #initialized = false;
    public async init(container: HTMLDivElement) {
        if (this.#initialized) {
            return;
        }
        this.#initialized = true;

        // handle resize on the container
        this.#resizeObserver.observe(container);

        if (!this.element) {
            // webgl loading failed for some reason, attach with DOM renderer
            this.open(container);
        }

        // fit is called within a setTimeout, cols and rows need this.
        setTimeout(async () => {
            this.fit();
        }, 0);

        void this.writeAsync(
            "\r\n\r\nWelcome to the Fern Shell!\r\n\r\nFern Shell is a browser-based shell with the Fern CLI pre-installed.\r\n\r\n",
        );
        await this.#writePrompt();

        this.onKey((e: KeyEvent) => {
            this.#keyStack++;
            const ev = e.domEvent;
            const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

            switch (ev.key) {
                case "Enter":
                    void this.#handleInput().finally(() => this.#writePrompt());
                    break;
                case "Backspace":
                    this.#handleBackspace(e.domEvent);
                    break;
                case "ArrowUp":
                    this.#handleArrowUp(e.domEvent);
                    break;
                case "ArrowDown":
                    this.#handleArrowDown(e.domEvent);
                    break;
                case "ArrowLeft":
                    this.#handleArrowLeft(e.domEvent);
                    break;
                case "ArrowRight":
                    this.#handleArrowRight(e.domEvent);
                    break;
                default:
                    if (printable) {
                        this.#handlePrintable(e);
                    } else {
                        this.#handleNonPrintable(e);
                    }
                    break;
            }
        });

        this.onData(this.#handleData.bind(this));

        this.addCommand("clear", async () => {
            this.#history.clear();
            await this.writeAsync(ansi.clearTerminal);
            return 0;
        });

        window.addEventListener("keydown", this.#handleWindowKeyDown.bind(this), { capture: true });
    }

    #writeLock = 0;
    #keyStack = 0;
    #handleData(data: string) {
        if (this.#writeLock > 0 || this.#keyStack > 0) {
            this.#keyStack--;
            return;
        }
        this.#keyStack--;
        void this.writeAsync(data);
        this.#maxCursorX += data.length;
    }

    #handleWindowKeyDown(e: KeyboardEvent) {
        if (e.metaKey && this.textarea === document.activeElement) {
            this.#handleMetaKey(e);
        }
    }

    // workaround for left and right arrow keys not being handled by xterm.js when meta key is pressed
    #handleMetaKey(e: KeyboardEvent) {
        if (e.key === "ArrowLeft") {
            this.#handleArrowLeft(e);
        } else if (e.key === "ArrowRight") {
            this.#handleArrowRight(e);
        }
    }

    public async deletePreviousLine() {
        await this.writeAsync(ansi.eraseUp);
    }

    public async writeAsync(data: string | Uint8Array): Promise<void> {
        this.#writeLock++;
        await new Promise<void>((resolve) => this.write(data, resolve));
        this.#writeLock--;
    }

    public async writelnAsync(data: string | Uint8Array): Promise<void> {
        this.#writeLock++;
        await new Promise<void>((resolve) => this.writeln(data, resolve));
        this.#writeLock--;
    }

    #commands = new Map<string, (terminal: FernShell, args: string[]) => Promise<number> | number>();
    public addCommand(
        command: string,
        callback: (terminal: FernShell, args: string[]) => Promise<number> | number,
    ): IDisposable {
        if (this.#commands.has(command)) {
            console.warn(`Command ${command} already exists`);
        }

        this.#commands.set(command, callback);
        return {
            dispose: () => {
                this.#commands.delete(command);
            },
        };
    }

    #completions = new Map<string, (terminal: FernShell, args: string[]) => Promise<string[]> | string[]>();
    public addCompletion(
        command: string,
        callback: (terminal: FernShell, args: string[]) => Promise<string[]> | string[],
    ): IDisposable {
        if (this.#completions.has(command)) {
            console.warn(`Completion ${command} already exists`);
        }

        this.#completions.set(command, callback);
        return {
            dispose: () => {
                this.#completions.delete(command);
            },
        };
    }

    async #handleInput() {
        const input = this.buffer.active
            .getLine(this.buffer.active.cursorY)
            ?.translateToString(true, this.#prompt.length)
            .trimStart();

        if (input) {
            this.#history.push(input);
        }
        this.#history.rewind();

        const argv = input?.split(" ");

        // ignore empty commands
        if (argv == null || argv.length === 0 || argv[0] == null || argv[0] === "") {
            return;
        }

        const command = argv[0];
        const args = argv.slice(1);
        const callback = this.#commands.get(command);
        if (callback) {
            await this.writeAsync("\r\n");
            const exitCode = await callback(this, args);
            if (exitCode !== 0) {
                await this.writeAsync(`\r\nexit code: ${exitCode}`);
            }
        } else {
            await this.writeAsync(`\r\ncommand not found: ${command}`);
        }
    }

    #prompt = "\u276F ";
    #maxCursorX = 0;
    async #writePrompt() {
        await this.writeAsync("\r\n" + this.#prompt);
        this.#maxCursorX = this.#prompt.length;
    }

    async #handleBackspace(e: KeyboardEvent) {
        // do not delete the prompt
        if (this.buffer.active.cursorX <= this.#prompt.length) {
            return;
        }

        let back = 1;
        if (e.metaKey) {
            back = this.buffer.active.cursorX - this.#prompt.length;
        }

        await this.writeAsync(ansi.cursorBackward(back) + " ".repeat(back) + ansi.cursorBackward(back));

        this.#maxCursorX -= back;
        if (this.#maxCursorX < this.#prompt.length) {
            this.#maxCursorX = this.#prompt.length;
        }
    }

    async #handlePrintable(e: KeyEvent) {
        if (this.buffer.active.cursorX < this.#maxCursorX) {
            const lineAfterCursor = this.buffer.active
                .getLine(this.buffer.active.cursorY)
                ?.translateToString(true, this.buffer.active.cursorX);
            if (lineAfterCursor && lineAfterCursor.length > 0) {
                await this.writeAsync(e.key + lineAfterCursor + ansi.cursorBackward(lineAfterCursor.length));
                this.#maxCursorX += e.key.length;
                return;
            }
        }
        await this.writeAsync(e.key);
        this.#maxCursorX += e.key.length;
    }

    async #handleNonPrintable(e: KeyEvent) {
        switch (e.domEvent.key) {
            case "c":
                if (e.domEvent.ctrlKey) {
                    this.#writePrompt();
                }
                break;
        }
    }

    async #handleArrowUp(e: KeyboardEvent) {
        if (e.metaKey || e.ctrlKey || e.altKey || this.#maxCursorX > this.#prompt.length) {
            return;
        }

        const prev = this.#history.prev();
        if (prev == null) {
            return;
        }

        await this.writeAsync(
            ansi.eraseLine + ansi.cursorBackward(this.buffer.active.cursorX) + this.#prompt + prev.command,
        );
        this.#maxCursorX = prev.command.length + this.#prompt.length;
    }

    async #handleArrowDown(e: KeyboardEvent) {
        if (e.metaKey || e.ctrlKey || e.altKey || this.#maxCursorX > this.#prompt.length) {
            return;
        }

        const next = this.#history.next();
        if (next == null) {
            await this.writeAsync(ansi.eraseLine + ansi.cursorBackward(this.buffer.active.cursorX) + this.#prompt);
            this.#maxCursorX = this.#prompt.length;
            return;
        }

        await this.writeAsync(
            ansi.eraseLine + ansi.cursorBackward(this.buffer.active.cursorX) + this.#prompt + next.command,
        );
        this.#maxCursorX = next.command.length + this.#prompt.length;
    }

    async #handleArrowLeft(e: KeyboardEvent) {
        if (this.buffer.active.cursorX <= this.#prompt.length) {
            return;
        }

        if (e.metaKey) {
            await this.writeAsync(ansi.cursorBackward(this.buffer.active.cursorX - this.#prompt.length));
        } else if (e.altKey) {
            // TODO: implement alt+left

            // const line = this.buffer.active.getLine(this.buffer.active.cursorY);
            // if (!line) {
            //     return;
            // }
            // let nextCursorX = line.translateToString(true, 0, this.buffer.active.cursorX - 1).lastIndexOf(" ") + 1;
            // if (nextCursorX < this.#prompt.length) {
            //     nextCursorX = this.#prompt.length;
            // }
            // await this.writeAsync(ansi.cursorBackward(this.buffer.active.cursorX - nextCursorX));
            await this.writeAsync("\b");
        } else {
            await this.writeAsync("\b");
        }
    }

    async #handleArrowRight(e: KeyboardEvent) {
        if (this.buffer.active.cursorX >= this.#maxCursorX) {
            return;
        }

        if (e.metaKey) {
            await this.writeAsync(ansi.cursorForward(this.#maxCursorX - this.buffer.active.cursorX));
        } else if (e.altKey) {
            // TODO: implement alt+right

            // const line = this.buffer.active.getLine(this.buffer.active.cursorY);
            // if (line == null) {
            //     return;
            // }
            // const forwardToEndOfLine = this.#maxCursorX - this.buffer.active.cursorX;
            // const lineAfterCursor = line.translateToString(true, this.buffer.active.cursorX);
            // let forward = lineAfterCursor.indexOf(" ") + 1;
            // if (forward === 0 && forward + this.buffer.active.cursorX < this.#maxCursorX) {
            //     forward = forwardToEndOfLine;
            // }
            // await this.writeAsync(ansi.cursorForward(forward));
            await this.writeAsync("\x1B[C");
        } else {
            await this.writeAsync("\x1B[C");
        }
    }
}
