import { getLoadableValue, Loadable, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { createContext, ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { Highlighter } from "shiki/index.mjs";
import { getHighlighterInstance, parseLang } from "../syntax-highlighting/fernShiki";

interface ShikiContextValue {
    value: Loadable<Highlighter>;
    loadLanguage: (language: string) => Promise<void>;
}

const ShikiContext = createContext<ShikiContextValue>({
    value: notStartedLoading(),
    loadLanguage: () => Promise.resolve(),
});

export function ShikiContextProvider({ children }: { children: React.ReactNode }): ReactElement {
    const [instance, setHighlighter] = useState<Loadable<Highlighter>>(notStartedLoading());

    useEffect(() => {
        setHighlighter(loading());
        void (async () => {
            setHighlighter(loaded(await getHighlighterInstance("plaintext")));
        })();
    }, [setHighlighter]);

    const loadLanguage = useMemo(
        () => async (language: string) => {
            const newInstance = await getHighlighterInstance(language);
            setHighlighter(loaded(newInstance));
        },
        [],
    );

    const value = useMemo<ShikiContextValue>(
        () => ({
            value: instance,
            loadLanguage,
        }),
        [instance, loadLanguage],
    );

    return <ShikiContext.Provider value={value}>{children}</ShikiContext.Provider>;
}

export function useHighlighterInstance(language: string): Highlighter | undefined {
    const { value: loadableHighlight, loadLanguage } = useContext(ShikiContext);
    const highlighterInstance = getLoadableValue(loadableHighlight);
    const hasLanguage = highlighterInstance?.getLoadedLanguages().includes(parseLang(language)) ?? false;
    useEffect(() => {
        if (hasLanguage) {
            return;
        }
        void (async () => {
            await loadLanguage(language);
        })();
    }, [hasLanguage, language, loadLanguage]);
    return hasLanguage ? highlighterInstance : undefined;
}
