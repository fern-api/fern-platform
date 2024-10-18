import { ClipboardAddon } from "@xterm/addon-clipboard";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { IDisposable, ITerminalInitOnlyOptions, ITerminalOptions, Terminal } from "@xterm/xterm";
import { BashEmulator } from "./BashEmulator";

const LOGO = `
           .       :+#%*          =#%@@@@@@+                                             
         :%@*:    *@@@@*         +@@@@@%%%%=                                             
         +@@@@*  .@@@@%.         #@@@#                                                   
   .     .%@@@@: :@#+-       +%%%@@@@@%%#%=  :+#@@@@@#*-    #%%*.+#%%%: #%%#-*%@@@%#=    
  *@%#+:   -%@@.=%=..        #@@@@@@@@@@@@+ #@@@%#**%@@@#.  @@@@@@@@%+  @@@@@@@%@@@@@%.  
  +@@@@@*    @@@@@@@@@%=.        #@@@# .   %@@@=     =@@@%  @@@@%:.     @@@@%:   -@@@@*  
   =%@@@@=  +@@#+=+#@@@@#.       #@@@#    :@@@@%%@@@%%@@@@- @@@@=       @@@@=     #@@@#  
     .-*@*:%@+       ..          #@@@#    :@@@@#######****: @@@@=       @@@@=     #@@@#  
        +@@@+=*%%%#+.            #@@@#     #@@@+     -====  @@@@=       @@@@=     #@@@#  
        *@@@@@@@@@@@@%=          #@@@#      *@@@@%#%@@@@@-  @@@@=       @@@@+     #@@@#  
        %@%:  :+%%@%#+.          +###+       :+#%@@@@%*-    ####-       ####-     +###+
`;

export class FernShell implements IDisposable {
    terminal: Terminal;
    #resizeObserver: ResizeObserver;
    #fitAddon: FitAddon;
    #bash: BashEmulator;

    constructor(options?: ITerminalOptions & ITerminalInitOnlyOptions) {
        this.terminal = new Terminal(options);
        const weblinksAddon = new WebLinksAddon();
        this.terminal.loadAddon(weblinksAddon);

        this.#fitAddon = new FitAddon();
        this.terminal.loadAddon(this.#fitAddon);

        const clipboardAddon = new ClipboardAddon();
        this.terminal.loadAddon(clipboardAddon);

        this.#resizeObserver = new ResizeObserver(() => {
            this.#fitAddon.fit();
        });

        this.#bash = new BashEmulator();
        this.terminal.loadAddon(this.#bash);
    }

    public fit() {
        this.#fitAddon.fit();
    }

    public dispose() {
        this.#resizeObserver.disconnect();
    }

    #initialized = false;
    public async open(container: HTMLDivElement) {
        if (this.#initialized) {
            return;
        }
        this.#initialized = true;

        // handle resize on the container
        this.#resizeObserver.observe(container);

        if (!this.terminal.element) {
            // webgl loading failed for some reason, attach with DOM renderer
            this.terminal.open(container);
        }

        this.#bash.mount();

        // fit is called within a setTimeout, cols and rows need this.
        setTimeout(async () => {
            this.fit();
        }, 0);

        this.terminal.write(LOGO.split("\n").join("\r\n"));
        this.terminal.write(
            "\r\n\r\nWelcome to the Fern Shell!\r\n\r\nFern Shell is a browser-based shell with the Fern CLI pre-installed.\r\n\r\n",
        );

        this.#bash.tty?.unlock();
        await this.#bash.tty?.prompt();
    }
}
