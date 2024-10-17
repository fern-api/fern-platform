import { IDisposable, ITerminalAddon, Terminal } from "@xterm/xterm";
import ansi from "ansi-escapes";
import ShellHistory from "../archive/history";

export class TeletypeController implements ITerminalAddon {
    private terminal?: Terminal;
    private locked: boolean = true;
    private disposables = new Set<IDisposable>();
    #carriageReturnHandlers = new Set<(input: string) => Promise<void>>();
    private history?: ShellHistory;

    private inputBuffer: string = "";

    activate(terminal: Terminal): void {
        this.terminal = terminal;
        this.history = new ShellHistory(100);
        this.disposables.add(terminal.onKey(this.#handleKey.bind(this)));
        window.addEventListener("keydown", this.#handleWindowKey.bind(this));
        this.disposables.add({
            dispose: () => {
                window.removeEventListener("keydown", this.#handleWindowKey.bind(this));
            },
        });
    }

    dispose(): void {
        this.disposables.forEach((d) => d.dispose());
        this.#carriageReturnHandlers.clear();
        this.disposables.clear();
        this.terminal = undefined;
        this.history?.clear();
    }

    onCarriageReturn(fn: (input: string) => Promise<void>): IDisposable {
        this.#carriageReturnHandlers.add(fn);
        const disposable = {
            dispose: () => {
                this.#carriageReturnHandlers.delete(fn);
                this.disposables.delete(disposable);
            },
        };
        this.disposables.add(disposable);
        return disposable;
    }

    #prompt = "$ ";
    write(chunk: string | Uint8Array): void {
        const encoded = typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
        if (this.locked || !this.terminal) {
            this.inputBuffer += encoded;
        } else {
            const cursorX = Math.max(this.terminal.buffer.normal.cursorX - this.#prompt.length, 0);

            this.inputBuffer = this.inputBuffer.slice(0, cursorX) + encoded + this.inputBuffer.slice(cursorX);

            this.terminal.write(
                ansi.eraseLine +
                    ansi.cursorTo(0) +
                    this.#prompt +
                    this.inputBuffer +
                    ansi.cursorTo(cursorX + this.#prompt.length + encoded.length),
            );
        }
    }

    async prompt() {
        this.clear();
        return new Promise<void>((resolve) => {
            if (!this.locked && this.terminal) {
                this.terminal.write(this.#prompt, () => {
                    this.unlock();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    get input(): string {
        return this.inputBuffer;
    }

    clear() {
        this.inputBuffer = "";
    }

    lock() {
        this.locked = true;
        this.terminal?.write(ansi.cursorHide);
    }

    unlock() {
        this.locked = false;
        this.terminal?.write(ansi.cursorShow);
    }

    get cursorX() {
        if (this.locked || !this.terminal) {
            return this.inputBuffer.length;
        }
        return this.terminal.buffer.normal.cursorX - this.#prompt.length;
    }

    #handleCarriageReturn() {
        if (this.locked) {
            return;
        }
        this.lock();
        const inputBuffer = this.inputBuffer;
        this.clear();
        new Promise<void>((resolve, reject) => {
            if (!this.terminal) {
                reject(new Error("Terminal not found"));
                return;
            }
            this.terminal.write("\r\n", async () => {
                for (const fn of this.#carriageReturnHandlers) {
                    try {
                        await fn(inputBuffer);
                    } catch (e) {
                        break;
                    }
                }
                this.terminal?.write(this.#prompt);
                this.unlock();
                resolve();
            });
        });
    }

    #handleKey(e: { key: string; domEvent: KeyboardEvent }) {
        if (e.domEvent.key === "Enter") {
            void this.#handleCarriageReturn();
            return;
        } else if (e.domEvent.key === "Backspace") {
            this.#handleBackspace(e.domEvent);
            return;
        } else if (e.domEvent.key === "ArrowUp") {
            if (this.locked) {
                return;
            }
            const historyEntry = this.history?.prev();
            if (historyEntry) {
                this.inputBuffer = historyEntry.command;
                this.terminal?.write(
                    ansi.cursorLeft + ansi.cursorForward(this.prompt.length + 2 + historyEntry.command.length),
                );
            } else {
                this.terminal?.write(ansi.cursorLeft + ansi.cursorForward(this.prompt.length + 2));
            }
            return;
        } else if (e.domEvent.key === "ArrowDown") {
            if (this.locked) {
                return;
            }
            const historyEntry = this.history?.next();
            if (historyEntry) {
                this.inputBuffer = historyEntry.command;
                this.terminal?.write(
                    ansi.cursorLeft + ansi.cursorForward(this.prompt.length + 2 + historyEntry.command.length),
                );
            } else {
                this.terminal?.write(
                    ansi.cursorLeft + ansi.cursorForward(this.prompt.length + 2 + this.inputBuffer.length),
                );
            }
            return;
        } else if (e.domEvent.key === "ArrowLeft") {
            if (this.locked) {
                return;
            }

            if (e.domEvent.metaKey) {
                this.terminal?.write(ansi.cursorLeft + ansi.cursorForward(this.prompt.length + 2));
                return;
            }

            if (e.domEvent.altKey) {
                // move to the beginning of the last word
                const nextX = this.inputBuffer.slice(0, this.cursorX).trimEnd().lastIndexOf(" ") + 1;
                this.terminal?.write(ansi.cursorLeft + ansi.cursorForward(this.prompt.length + 2 + nextX));
                return;
            }

            if (this.cursorX > 0) {
                this.terminal?.write(ansi.cursorBackward(1));
            }
            return;
        } else if (e.domEvent.key === "ArrowRight") {
            if (this.locked) {
                return;
            }

            if (e.domEvent.metaKey) {
                this.terminal?.write(
                    ansi.cursorLeft + ansi.cursorForward(this.prompt.length + 2 + this.inputBuffer.length),
                );
                return;
            }

            if (e.domEvent.altKey) {
                // move to the start of the next word, or to the end of the input if there is no next word
                const remainderOfString = this.inputBuffer.slice(this.cursorX);

                let nextCursorX = this.cursorX;

                if (remainderOfString.trim().length === 0) {
                    nextCursorX = this.inputBuffer.length;
                } else if (remainderOfString.startsWith(" ")) {
                    const nextNonSpaceIndex = remainderOfString.indexOf(remainderOfString.trimStart()[0]);
                    nextCursorX = this.cursorX + nextNonSpaceIndex;
                } else {
                    const nextSpaceIndex = remainderOfString.indexOf(" ");
                    if (nextSpaceIndex === -1) {
                        nextCursorX = this.inputBuffer.length;
                    } else {
                        const nextNonSpaceIndex = remainderOfString
                            .slice(nextSpaceIndex)
                            .indexOf(remainderOfString.slice(nextSpaceIndex).trim()[0]);
                        nextCursorX = this.cursorX + nextSpaceIndex + nextNonSpaceIndex;
                    }
                }

                this.terminal?.write(ansi.cursorLeft + ansi.cursorForward(this.prompt.length + 2 + nextCursorX));
                return;
            }

            if (this.cursorX < this.inputBuffer.length) {
                this.terminal?.write(ansi.cursorForward(1));
            }
            return;
        }

        if (e.domEvent.key === "c" && e.domEvent.ctrlKey) {
            this.lock();
            this.inputBuffer = "";
            // TODO: abort the current command

            this.terminal?.write("\r\n" + this.#prompt + ansi.cursorTo(this.prompt.length + 2));
            this.unlock();
            return;
        }

        const printable = !e.domEvent.altKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
        if (printable) {
            this.write(e.key);
        }
    }

    // workaround for left and right arrow keys not being handled by xterm.js when meta key is pressed
    #handleWindowKey(e: KeyboardEvent) {
        if (document.activeElement !== this.terminal?.textarea) {
            return;
        }
        if (e.key === "ArrowLeft" && e.metaKey) {
            this.#handleKey({ key: "ArrowLeft", domEvent: e });
        } else if (e.key === "ArrowRight" && e.metaKey) {
            this.#handleKey({ key: "ArrowRight", domEvent: e });
        }
    }

    #handleBackspace(e: KeyboardEvent) {
        if (this.cursorX <= 0) {
            return;
        }

        if (e.metaKey) {
            this.inputBuffer = "";
            if (!this.locked && this.terminal) {
                this.terminal.write(ansi.eraseLine + ansi.cursorTo(0) + this.#prompt);
            }
            return;
        }
        const nextCursorX = this.cursorX - 1;
        this.inputBuffer = this.inputBuffer.slice(0, nextCursorX) + this.inputBuffer.slice(this.cursorX);
        if (!this.locked && this.terminal) {
            this.terminal.write(
                ansi.eraseLine +
                    ansi.cursorTo(0) +
                    this.#prompt +
                    this.inputBuffer +
                    ansi.cursorTo(nextCursorX + this.#prompt.length),
            );
        }
    }
}
