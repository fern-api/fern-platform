import { ReactElement, createContext, useContext, useMemo } from "react";
import { noop } from "ts-essentials";

const CommandUxContext = createContext<{
    focus: (opts?: { scrollToTop?: boolean }) => void;
    setInputError: (error: string | null) => void;
    setValue: (value: string) => void;
}>({
    focus: noop,
    setInputError: noop,
    setValue: noop,
});

function CommandUxProvider({
    focus,
    setInputError,
    setValue,
    children,
}: {
    focus: (opts?: { scrollToTop?: boolean }) => void;
    setInputError: (error: string | null) => void;
    setValue: (value: string) => void;
    children: React.ReactNode;
}): ReactElement {
    const value = useMemo(() => ({ focus, setInputError, setValue }), [focus, setInputError, setValue]);
    return <CommandUxContext.Provider value={value}>{children}</CommandUxContext.Provider>;
}

function useCommandUx(): {
    focus: (opts?: { scrollToTop?: boolean }) => void;
    setInputError: (error: string | null) => void;
    setValue: (value: string) => void;
} {
    return useContext(CommandUxContext);
}

export { CommandUxProvider, useCommandUx };
