// import { IDisposable, Terminal } from "@xterm/xterm";
// import { TTYImpl, type TTY } from "./tty";

// export class XTerminal extends Terminal {
//     target: EventTarget = new EventTarget();

//     addEventListener(
//         type: string,
//         listener: EventListenerOrEventListenerObject,
//         options?: boolean | AddEventListenerOptions,
//     ): void {
//         return this.target.addEventListener(type, listener, options);
//     }

//     container: HTMLElement | undefined = undefined;

//     tty: TTY;
//     isOpen: boolean = false;
//     pendingPrintOnOpen: string = "";

//     disposables: IDisposable[] = [];

//     constructor() {
//         super();

//         this.tty = new TTYImpl(this);

//         this.disposables.push(
//             this.onData((data) => {
//                 this.dispatchEvent(new CustomEvent("data", { detail: data }));
//             }),
//         );

//         this.fit = this.fit.bind(this);
//         this.focus = this.focus.bind(this);
//         this.dispatchEvent = this.dispatchEvent.bind(this);
//     }

//     dispatchEvent(event: Event): boolean {
//         return this.target.dispatchEvent(event);
//     }

//     removeEventListener(
//         type: string,
//         callback: EventListenerOrEventListenerObject,
//         options?: boolean | EventListenerOptions,
//     ): void {
//         return this.target.removeEventListener(type, callback, options);
//     }

//     private fitAddon: { fit: () => void } | undefined;
//     async open(container: HTMLElement) {
//         await import("@xterm/xterm/css/xterm.css");

//         this.disposables.push(this.onResize(({ cols, rows }) => this.tty.resize(cols, rows)));

//         this.onKey((keyEvent: { key: string; domEvent: KeyboardEvent }) => {
//             // Fix for iOS Keyboard Jumping on space
//             if (keyEvent.key === " ") {
//                 keyEvent.domEvent.preventDefault();
//                 // keyEvent.domEvent.stopPropagation();
//                 return false;
//             }
//         });

//         // Remove any current event listeners
//         this.container?.removeEventListener("click", this.focus);
//         this.container?.removeEventListener("tap", this.focus);

//         const { WebLinksAddon } = await import("@xterm/addon-web-links");
//         const { FitAddon } = await import("@xterm/addon-fit");

//         const webLinksAddon = new WebLinksAddon();
//         const fitAddon = new FitAddon();
//         this.loadAddon(webLinksAddon);
//         this.loadAddon(fitAddon);
//         this.fitAddon = fitAddon;

//         this.container = container;

//         super.open(container);
//         this.isOpen = true;
//         setTimeout(() => {
//             // on mobile, we need to focus the terminal when the container is clicked
//             this.container?.addEventListener("click", this.focus);
//             this.container?.addEventListener("tap", this.focus);

//             // print any pending input
//             if (this.pendingPrintOnOpen) {
//                 this.tty.print(this.pendingPrintOnOpen + "\n");
//                 this.pendingPrintOnOpen = "";
//             }
//         });

//         this.fit();
//     }

//     fit() {
//         this.fitAddon?.fit();
//     }

//     focus() {
//         super.focus();

//         // To fix iOS keyboard, scroll to the cursor in the terminal
//         this.scrollWindowToCursor();
//     }

//     private scrollWindowToCursor() {
//         if (!this.container) {
//             return;
//         }

//         // We don't need cursorX, since we want to start at the beginning of the terminal.
//         const cursorY = this.buffer.normal.cursorY;

//         const { height, left, top } = this.container.getBoundingClientRect();

//         // Find how much to scroll because of our cursor
//         const cursorOffsetY = (cursorY / this.rows) * height;

//         const scrollX = Math.max(0, left);
//         const scrollY = Math.min(top + cursorOffsetY + 10, document.body.scrollHeight);

//         window.scrollTo(scrollX, scrollY);
//     }

//     dispose() {
//         this.disposables.forEach((d) => d.dispose());
//         super.dispose();
//     }

//     onPaste(data: string) {
//         this.tty.print(data);
//     }
// }
