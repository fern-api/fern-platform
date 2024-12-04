import { ReactElement, createContext, useContext, useMemo } from "react";
import { noop } from "ts-essentials";

const CommandUxContext = createContext<{
    focusAndScrollTop: () => void;
    setInputError: (error: string | null) => void;
}>({
    focusAndScrollTop: noop,
    setInputError: noop,
});

function CommandUxProvider({
    focusAndScrollTop,
    setInputError,
    children,
}: {
    focusAndScrollTop: () => void;
    setInputError: (error: string | null) => void;
    children: React.ReactNode;
}): ReactElement {
    const value = useMemo(() => ({ focusAndScrollTop, setInputError }), [focusAndScrollTop, setInputError]);
    return <CommandUxContext.Provider value={value}>{children}</CommandUxContext.Provider>;
}

function useCommandUx(): {
    focusAndScrollTop: () => void;
    setInputError: (error: string | null) => void;
} {
    return useContext(CommandUxContext);
}

export { CommandUxProvider, useCommandUx };
