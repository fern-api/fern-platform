import { getLoadableValue, Loadable, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { noop } from "lodash-es";
import { createContext, Dispatch, ReactElement, SetStateAction, useContext, useEffect, useState } from "react";
import { Highlighter } from "shiki/index.mjs";
import { getHighlighterInstance, parseLang } from "../syntax-highlighting/fernShiki";

const ShikiContext = createContext<
    [Loadable<Highlighter, unknown>, Dispatch<SetStateAction<Loadable<Highlighter, unknown>>>]
>([notStartedLoading(), noop]);

export function ShikiContextProvider({ children }: { children: React.ReactNode }): ReactElement {
    const highlighterState = useState<Loadable<Highlighter>>(notStartedLoading());
    const setHighlighter = highlighterState[1];

    useEffect(() => {
        setHighlighter(loading());
        void (async () => {
            setHighlighter(loaded(await getHighlighterInstance("plaintext")));
        })();
    }, [setHighlighter]);

    return <ShikiContext.Provider value={highlighterState}>{children}</ShikiContext.Provider>;
}

export function useHighlighterInstance(language: string): Highlighter | undefined {
    const [highlighter, setHighlighter] = useContext(ShikiContext);
    const highlighterInstance = getLoadableValue(highlighter);
    const hasLanguage = highlighterInstance?.getLoadedLanguages().includes(parseLang(language)) ?? false;
    useEffect(() => {
        if (hasLanguage) {
            return;
        }
        void (async () => {
            setHighlighter(loaded(await getHighlighterInstance(language)));
        })();
    }, [hasLanguage, language, setHighlighter]);
    return hasLanguage ? highlighterInstance : undefined;
}
