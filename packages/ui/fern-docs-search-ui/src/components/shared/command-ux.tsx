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

function CommandUxProvider({
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
    const value = useMemo(() => ({ focus, scrollTop, setInputError }), [focus, scrollTop, setInputError]);
    return <CommandUxContext.Provider value={value}>{children}</CommandUxContext.Provider>;
}

function useCommandUx(): {
    focus: () => void;
    scrollTop: () => void;
    setInputError: (error: string | null) => void;
} {
    return useContext(CommandUxContext);
}

export { CommandUxProvider, useCommandUx };
