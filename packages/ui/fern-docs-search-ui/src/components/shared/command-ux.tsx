import { ReactElement, createContext, useContext, useMemo } from "react";
import { noop } from "ts-essentials";

const CommandUxContext = createContext({
    focus: noop,
    scrollTop: noop,
});

export function CommandUxProvider({
    focus,
    scrollTop,
    children,
}: {
    focus: () => void;
    scrollTop: () => void;
    children: React.ReactNode;
}): ReactElement {
    return (
        <CommandUxContext.Provider value={useMemo(() => ({ focus, scrollTop }), [focus, scrollTop])}>
            {children}
        </CommandUxContext.Provider>
    );
}

export function useCommandUx(): { focus: () => void; scrollTop: () => void } {
    return useContext(CommandUxContext);
}
