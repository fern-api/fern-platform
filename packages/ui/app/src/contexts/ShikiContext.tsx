import { noop } from "lodash-es";
import { createContext, Dispatch, ReactElement, SetStateAction, useContext, useEffect, useState } from "react";
import { Highlighter } from "shiki/index.mjs";
import { getHighlighterInstance, parseLang } from "../syntax-highlighting/fernShiki";

const ShikiContext = createContext<[Highlighter | undefined, Dispatch<SetStateAction<Highlighter | undefined>>]>([
    undefined,
    noop,
]);

export function ShikiContextProvider({ children }: { children: React.ReactNode }): ReactElement {
    const highlighterState = useState<Highlighter>();
    const setHighlighter = highlighterState[1];

    useEffect(() => {
        void (async () => {
            setHighlighter(await getHighlighterInstance("plaintext"));
        })();
    }, [setHighlighter]);

    return <ShikiContext.Provider value={highlighterState}>{children}</ShikiContext.Provider>;
}

export function useHighlighterInstance(language: string): Highlighter | undefined {
    const [highlighterInstance, setHighlighterInstance] = useContext(ShikiContext);
    const hasLanguage = highlighterInstance?.getLoadedLanguages().includes(parseLang(language)) ?? false;
    useEffect(() => {
        if (hasLanguage) {
            return;
        }
        void (async () => {
            setHighlighterInstance(await getHighlighterInstance(language));
        })();
    }, [hasLanguage, language, setHighlighterInstance]);
    return hasLanguage ? highlighterInstance : undefined;
}
