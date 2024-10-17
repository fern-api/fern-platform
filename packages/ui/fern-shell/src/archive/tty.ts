// import type { Terminal } from "@xterm/xterm";
// import { ActivePrompt } from "./prompt";

// export interface TTY {
//     prompt(promptPrefix: string, continuationPromptPrefix?: string): void;
//     print(data: string, cb?: () => void): void;
//     println(data: string, cb?: () => void): void;
//     clearInput(): void;
//     setInput(data: string, shouldNotClearInput?: boolean): void;
//     resize(cols: number, rows: number): void;
//     setCursor(newCursor: number): void;
//     setCursorDirectly(newCursor: number): void;
//     readonly input: string;
//     readonly size: { rows: number; cols: number };
//     readonly firstInit: boolean;
// }

// export class TTYImpl implements TTY {
//     #promptPrefix: string = "";
//     #continuationPromptPrefix: string = "";
//     #input = "";
//     #cursor: number = 0;
//     #size: { rows: number; cols: number } = { rows: 0, cols: 0 };
//     #firstInit = true;

//     constructor(private xterm: Terminal) {
//         this.#size.cols = xterm.cols;
//         this.#size.rows = xterm.rows;
//     }

//     get input(): string {
//         return this.#input;
//     }

//     get size(): { rows: number; cols: number } {
//         return this.#size;
//     }

//     get firstInit(): boolean {
//         return this.#firstInit;
//     }

//     prompt(promptPrefix: string, continuationPromptPrefix: string = "> "): ActivePrompt {
//         if (promptPrefix.length > 0) {
//             this.print(promptPrefix);
//         }

//         this.#firstInit = true;
//         this.#promptPrefix = promptPrefix;
//         this.#continuationPromptPrefix = continuationPromptPrefix;
//         this.#input = "";
//         this.#cursor = 0;

//         return {
//             promptPrefix,
//             continuationPromptPrefix,
//             ...this._getAsyncRead(),
//         };
//     }

//     /**
//      * Function to return a deconstructed readPromise
//      */
//     _getAsyncRead() {
//         let readResolve;
//         let readReject;
//         const readPromise = new Promise((resolve, reject) => {
//             readResolve = (response: string) => {
//                 this.#promptPrefix = "";
//                 this.#continuationPromptPrefix = "";
//                 resolve(response);
//             };
//             readReject = reject;
//         });

//         return {
//             promise: readPromise,
//             resolve: readResolve,
//             reject: readReject,
//         };
//     }

//     clearInput(): void {
//         const currentPrompt = this.applyPrompts(this.#input);

//         // Get the overall number of lines to clear
//         const allRows = countLines(currentPrompt, this.#size.cols);

//         // Get the line we are currently in
//         const promptCursor = this.applyPromptOffset(this.#input, this.#cursor);
//         const { row } = offsetToColRow(currentPrompt, promptCursor, this.#size.cols);

//         // First move on the last line
//         const moveRows = allRows - row - 1;
//         for (let i = 0; i < moveRows; ++i) {
//             this.xterm.write("\x1B[E");
//         }

//         // Clear current input line(s)
//         this.xterm.write("\r\x1B[K");
//         for (let i = 1; i < allRows; ++i) {
//             this.xterm.write("\x1B[F\x1B[K");
//         }
//     }

//     setInput(newInput: string, clearInput: boolean = true): void {
//         if (!clearInput) {
//             this.clearInput();
//         }

//         // Write the new input lines, including the current prompt
//         const newPrompt = this.applyPrompts(newInput);
//         this.print(newPrompt);

//         // Trim cursor overflow
//         this.#cursor = Math.min(this.#cursor, newInput.length);

//         // Move the cursor to the appropriate row/col
//         const newCursor = this.applyPromptOffset(newInput, this.#cursor);
//         const newLines = countLines(newPrompt, this.#size.cols);
//         const { col, row } = offsetToColRow(newPrompt, newCursor, this.#size.cols);
//         const moveUpRows = newLines - row - 1;

//         // Move the cursor to the appropriate row/col
//         this.xterm.write("\r"); // Move to the beginning of the line

//         for (let i = 0; i < moveUpRows; ++i) {
//             this.xterm.write("\x1B[F"); // Move down a line
//         }

//         for (let i = 0; i < col; ++i) {
//             this.xterm.write("\x1B[C"); // Move right a column
//         }

//         // Replace input
//         this.#input = newInput;
//     }

//     /**
//      * Prints a message and changes line
//      */
//     println(message: string) {
//         this.print(message + "\n");
//     }

//     /**
//      * Prints a message and properly handles new-lines
//      */
//     print(message: string, cb?: () => void) {
//         const msg = message.replace(/(\r\n)|(\n)/g, "\n").replace(/\n/g, "\r\n");
//         this.xterm.write(msg, cb);
//     }

//     /**
//      * Handle terminal resize
//      *
//      * This function clears the prompt using the previous configuration,
//      * updates the cached terminal size information and then re-renders the
//      * input. This leads (most of the times) into a better formatted input.
//      */
//     resize(cols: number, rows: number) {
//         this.clearInput();
//         this.#size.rows = rows;
//         this.#size.cols = cols;
//         this.setInput(this.#input, true);
//     }

//     /**
//      * Apply prompts to the given input
//      */
//     private applyPrompts(input: string): string {
//         return this.#promptPrefix + input.replace(/\n/g, "\n" + this.#continuationPromptPrefix);
//     }

//     /**
//      * Advances the `offset` as required in order to accompany the prompt
//      * additions to the input.
//      */
//     private applyPromptOffset(input: string, offset: number): number {
//         const newInput = this.applyPrompts(input.substring(0, offset));
//         return newInput.length;
//     }

//     /**
//      * Set the new cursor position, as an offset on the input string
//      *
//      * This function:
//      * - Calculates the previous and current
//      */
//     setCursor(newCursor: number) {
//         if (newCursor < 0) {
//             newCursor = 0;
//         }
//         if (newCursor > this.#input.length) {
//             newCursor = this.#input.length;
//         }
//         this.#writeCursorPosition(newCursor);
//     }

//     /**
//      * Sets the direct cursor value. Should only be used in keystroke contexts
//      */
//     setCursorDirectly(newCursor: number) {
//         this.#writeCursorPosition(newCursor);
//     }

//     #writeCursorPosition(newCursor: number) {
//         // Apply prompt formatting to get the visual status of the display
//         const inputWithPrompt = this.applyPrompts(this.#input);

//         // Estimate previous cursor position
//         const prevPromptOffset = this.applyPromptOffset(this.#input, this.#cursor);
//         const { col: prevCol, row: prevRow } = offsetToColRow(inputWithPrompt, prevPromptOffset, this.#size.cols);

//         // Estimate next cursor position
//         const newPromptOffset = this.applyPromptOffset(this.#input, newCursor);
//         const { col: newCol, row: newRow } = offsetToColRow(inputWithPrompt, newPromptOffset, this.#size.cols);

//         // Adjust vertically
//         if (newRow > prevRow) {
//             for (let i = prevRow; i < newRow; ++i) {
//                 this.print("\x1B[B");
//             }
//         } else {
//             for (let i = newRow; i < prevRow; ++i) {
//                 this.print("\x1B[A");
//             }
//         }

//         // Adjust horizontally
//         if (newCol > prevCol) {
//             for (let i = prevCol; i < newCol; ++i) {
//                 this.print("\x1B[C");
//             }
//         } else {
//             for (let i = newCol; i < prevCol; ++i) {
//                 this.print("\x1B[D");
//             }
//         }

//         // Set new offset
//         this.#cursor = newCursor;
//     }
// }

// /**
//  * Convert offset at the given input to col/row location
//  *
//  * This function is not optimized and practically emulates via brute-force
//  * the navigation on the terminal, wrapping when they reach the column width.
//  */
// function offsetToColRow(input: string, offset: number, maxCols: number) {
//     let row = 0;
//     let col = 0;

//     for (let i = 0; i < offset; ++i) {
//         const chr = input.charAt(i);
//         if (chr === "\n") {
//             col = 0;
//             row += 1;
//         } else {
//             col += 1;
//             if (col > maxCols) {
//                 col = 0;
//                 row += 1;
//             }
//         }
//     }

//     return { row, col };
// }

// /**
//  * Counts the lines in the given input
//  */
// function countLines(input: string, maxCols: number) {
//     return offsetToColRow(input, input.length, maxCols).row + 1;
// }
