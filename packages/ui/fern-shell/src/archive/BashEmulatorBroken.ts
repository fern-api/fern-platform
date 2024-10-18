// import { ITerminalAddon, Terminal } from "@xterm/xterm";
// import { TeletypeController } from "./TeletypeController";
// import { routes } from "./commands/routes";
// import { CommandProps } from "./commands/types";
// import { parseArgv } from "./parseArgv";

// export class BashEmulator implements ITerminalAddon {
//     #terminal?: Terminal;
//     #commands = new Map<string, (props: CommandProps) => Promise<number>>();
//     #completions = new Map<string, (argv: string[]) => Promise<string[]>>();
//     tty?: TeletypeController;

//     constructor() {}

//     activate(terminal: Terminal): void {
//         this.#terminal = terminal;
//         this.tty = new TeletypeController();
//         this.tty.activate(terminal);

//         this.tty.onCarriageReturn(this.#handleCarriageReturn.bind(this));

//         Object.entries(routes).forEach(([command, handler]) => {
//             this.addCommand(command, handler);
//         });
//     }

//     dispose(): void {
//         this.#terminal = undefined;
//         this.tty?.dispose();
//         this.tty = undefined;
//         this.#commands.clear();
//         this.#completions.clear();
//     }

//     mount() {
//         this.tty?.mount();
//     }

//     addCommand(command: string, fn: (props: CommandProps) => Promise<number>): void {
//         this.#commands.set(command, fn);
//     }

//     removeCommand(command: string): void {
//         this.#commands.delete(command);
//     }

//     addCompletion(command: string, fn: (argv: string[]) => Promise<string[]>): void {
//         this.#completions.set(command, fn);
//     }

//     removeCompletion(command: string): void {
//         this.#completions.delete(command);
//     }

//     env = new Map<string, string>([["?", "0"]]);

//     async #handleCarriageReturn(input: string): Promise<void> {
//         try {
//             const pipes = splitPipes(parseArgv(input));
//             const stdouts: ReadableStream<string>[] = [];
//             const exits: Promise<number>[] = [];
//             const pipedPromises: Promise<void>[] = [];
//             for (let i = 0; i < pipes.length; i++) {
//                 const argv = pipes[i]!;
//                 const command = argv[0];
//                 if (command != null && command.length > 0) {
//                     const [exitPromise, stdout, stdin] = this.#handleRunCommand(command, argv, i === pipes.length - 1);
//                     stdouts.push(stdout);
//                     exits.push(exitPromise);
//                     if (i > 0) {
//                         pipedPromises.push(stdouts[i - 1]!.pipeTo(stdin));
//                         console.log("piped", i, "to", i - 1, "from", stdouts[i - 1], stdin);
//                     }
//                 } else {
//                     exits.push(Promise.resolve(0));
//                 }
//             }

//             const results = await Promise.all(exits);
//             await Promise.all(pipedPromises);
//             const exitCode = results.reduce((acc, curr) => (curr === 0 ? acc : curr), 0);
//             this.env.set("?", String(exitCode));
//         } catch (error) {
//             console.error("Error running command:", error);
//         }
//     }

//     #handleRunCommand(
//         command: string,
//         argv: string[],
//         writeToTerminal: boolean = false,
//     ): [exit: Promise<number>, stdout: ReadableStream<string>, stdin: WritableStream<string>] {
//         const fn = this.#commands.get(command);

//         console.log("Running command:", command, argv);

//         const stdout = new TransformStream<string, string>({
//             start: () => {
//                 console.log("start stdout");
//             },
//             transform: (chunk, controller) => {
//                 console.log("stdout chunk:", chunk);
//                 if (writeToTerminal) {
//                     this.#terminal?.write(chunk.replace(/(?<!\r)\n/g, "\r\n"));
//                 }
//                 controller.enqueue(chunk);
//             },
//             flush: () => {
//                 console.log("flush stdout");
//             },
//         });

//         const stderr = new WritableStream<string>({
//             start: () => {
//                 console.log("start stderr");
//             },
//             write: (chunk) => {
//                 console.log("stderr chunk:", chunk);
//                 if (writeToTerminal) {
//                     this.#terminal?.write(chunk.replace(/(?<!\r)\n/g, "\r\n"));
//                 }
//             },
//             close: () => {
//                 console.log("flush stderr");
//             },
//             abort: (error) => {
//                 console.log("abort stderr", error);
//             },
//         });

//         const stdin = new TransformStream<string, string>({
//             start: () => {
//                 console.log("start stdin");
//             },
//             transform: (chunk, controller) => {
//                 console.log("stdin chunk:", chunk);
//                 controller.enqueue(chunk);
//             },
//             flush: () => {
//                 console.log("flush stdin");
//             },
//         });

//         if (!fn) {
//             const stderrWriter = stderr.getWriter();
//             stderrWriter
//                 .write(`${command}: command not found\r\n`)
//                 .then(() => {
//                     stderrWriter.close();
//                     stdout.writable.close();
//                     stdin.writable.close();
//                     stdin.readable.cancel();
//                     stdout.readable.cancel();
//                     console.log("Canceled all streams");
//                 })
//                 .finally(() => {
//                     stderrWriter.releaseLock();
//                     console.log("Released stderr writer lock");
//                 });
//             return [Promise.resolve(127), stdout.readable, stdin.writable];
//         }

//         const stderrWriter = stderr.getWriter();
//         const stdoutWriter = stdout.writable.getWriter();
//         const stdinReader = stdin.readable.getReader();

//         console.log("Running command:", command, argv);
//         return [
//             fn({
//                 argv,
//                 stdout: stdoutWriter,
//                 stderr: stderrWriter,
//                 stdin: stdinReader,
//                 env: this.env,
//             })
//                 .then((exit) => {
//                     console.log("Canceled stdin reader");
//                     stdoutWriter.close();
//                     stderrWriter.close();
//                     stdinReader.cancel();
//                     stdout.readable.cancel();
//                     // stdin.writable.close();
//                     return exit;
//                 })
//                 .catch((error) => {
//                     console.error("Command execution error:", error);
//                     stdoutWriter.abort(error);
//                     stderrWriter.abort(error);
//                     stdinReader.cancel(error);
//                     stdout.readable.cancel(error);
//                     stdin.writable.abort(error);
//                     console.log("Canceled stdin reader");
//                     return 1; // Non-zero exit code on error
//                 })
//                 .finally(() => {
//                     stdoutWriter.releaseLock();
//                     stderrWriter.releaseLock();
//                     stdinReader.releaseLock();
//                     console.log("Released all stream locks.");
//                 }),
//             stdout.readable,
//             stdin.writable,
//         ];
//     }
// }

// function splitPipes(argv: string[]): string[][] {
//     const pipes: string[][] = [];
//     let current: string[] = [];
//     for (const arg of argv) {
//         if (arg === "|") {
//             pipes.push(current);
//             current = [];
//         } else {
//             current.push(arg);
//         }
//     }
//     pipes.push(current);
//     return pipes.filter((pipe) => pipe.length > 0);
// }
