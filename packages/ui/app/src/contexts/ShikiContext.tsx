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
    const [hasLanguage, setHasLanguage] = useState(
        () => highlighterInstance?.getLoadedLanguages().includes(parseLang(language)) ?? false,
    );
    useEffect(() => {
        if (hasLanguage) {
            return;
        }
        void (async () => {
            // getHighlighterInstance actually returns the same highlighter instance
            // so we also need to setHasLanguage(true) to trigger a re-render
            setHighlighterInstance(await getHighlighterInstance(language));
            setHasLanguage(true);
        })();
    }, [hasLanguage, language, setHighlighterInstance]);
    return hasLanguage ? highlighterInstance : undefined;
}
