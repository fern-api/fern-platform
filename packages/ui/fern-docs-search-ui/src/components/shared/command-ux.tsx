import { ReactElement, createContext, useContext, useMemo } from "react";
import { noop } from "ts-essentials";

const CommandUxContext = createContext<{
    focus: (opts?: { scrollToTop?: boolean }) => void;
    setInputError: (error: string | null) => void;
    input: HTMLInputElement | null;
}>({
    focus: noop,
    setInputError: noop,
    input: null,
});

function CommandUxProvider({
    focus,
    setInputError,
    children,
    input,
}: {
    focus: (opts?: { scrollToTop?: boolean }) => void;
    setInputError: (error: string | null) => void;
    input: HTMLInputElement | null;
    children: React.ReactNode;
}): ReactElement {
    const value = useMemo(() => ({ focus, setInputError, input }), [focus, setInputError, input]);
    return <CommandUxContext.Provider value={value}>{children}</CommandUxContext.Provider>;
}

function useCommandUx(): {
    focus: (opts?: { scrollToTop?: boolean }) => void;
    setInputError: (error: string | null) => void;
    input: HTMLInputElement | null;
} {
    return useContext(CommandUxContext);
}

export { CommandUxProvider, useCommandUx };
