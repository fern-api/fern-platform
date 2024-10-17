import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import { FernShell } from "./shell/FernShell";

function App() {
    const ref = useRef<HTMLDivElement>(null);

    const shell = useRef(
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

        const currentShell = shell.current;
        void currentShell.open(ref.current).then(() => currentShell.terminal.focus());

        return () => {
            currentShell.dispose();
        };
    }, []);

    return <div id="xterminal" ref={ref} />;
}

export default App;
