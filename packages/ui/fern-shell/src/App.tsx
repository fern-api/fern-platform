import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import { FernShell } from "./fernshell";

function App() {
    const ref = useRef<HTMLDivElement>(null);
    const terminal = useRef(
        new FernShell({
            cursorBlink: true,
            cursorStyle: "block",
            macOptionIsMeta: true,
            macOptionClickForcesSelection: true,
        }),
    );

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const term = terminal.current;
        void term.init(ref.current).then(() => term.focus());
    }, []);

    return <div id="xterminal" ref={ref} />;
}

export default App;
