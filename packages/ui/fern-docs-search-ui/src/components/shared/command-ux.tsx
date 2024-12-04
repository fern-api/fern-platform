import { ReactElement, createContext, useContext, useMemo } from "react";
import { noop } from "ts-essentials";

const CommandUxContext = createContext<{
    focus: () => void;
    scrollTop: () => void;
    setInputError: (error: string | null) => void;
}>({
    focus: noop,
    scrollTop: noop,
    setInputError: noop,
});

export function CommandUxProvider({
    focus,
    scrollTop,
    setInputError,
    children,
}: {
    focus: () => void;
    scrollTop: () => void;
    setInputError: (error: string | null) => void;
    children: React.ReactNode;
}): ReactElement {
    return (
        <CommandUxContext.Provider
            value={useMemo(() => ({ focus, scrollTop, setInputError }), [focus, scrollTop, setInputError])}
        >
            {children}
        </CommandUxContext.Provider>
    );
}

export function useCommandUx(): {
    focus: () => void;
    scrollTop: () => void;
    setInputError: (error: string | null) => void;
} {
    return useContext(CommandUxContext);
}
