import { ReactElement, createContext, useContext, useMemo } from "react";
import { noop } from "ts-essentials";

const CommandUxContext = createContext<{
    focus: (opts?: { scrollToTop?: boolean }) => void;
    setInputError: (error: string | null) => void;
}>({
    focus: noop,
    setInputError: noop,
});

function CommandUxProvider({
    focus,
    setInputError,
    children,
}: {
    focus: (opts?: { scrollToTop?: boolean }) => void;
    setInputError: (error: string | null) => void;
    children: React.ReactNode;
}): ReactElement {
    const value = useMemo(() => ({ focus, setInputError }), [focus, setInputError]);
    return <CommandUxContext.Provider value={value}>{children}</CommandUxContext.Provider>;
}

function useCommandUx(): {
    focus: (opts?: { scrollToTop?: boolean }) => void;
    setInputError: (error: string | null) => void;
} {
    return useContext(CommandUxContext);
}

export { CommandUxProvider, useCommandUx };
