import { forwardRef, useMemo } from "react";
import { createRawTokens, highlightTokens, useHighlighter } from "./fernShiki";
import "./FernSyntaxHighlighter.css";
import { FernSyntaxHighlighterTokens } from "./FernSyntaxHighlighterTokens";

// [number, number] is a range of lines to highlight
type HighlightLine = number | [number, number];

export interface FernSyntaxHighlighterProps {
    className?: string;
    style?: React.CSSProperties;
    id?: string;
    code: string;
    language: string;
    fontSize?: "sm" | "base" | "lg";
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";
    viewportRef?: React.RefObject<HTMLDivElement>;
}

// const CACHED_HIGHLIGHTS_ATOM = atom<Record<string, HighlightedTokens>>({});

export const FernSyntaxHighlighter = forwardRef<HTMLPreElement, FernSyntaxHighlighterProps>((props, ref) => {
    const { id, code, language, ...innerProps } = props;
    const highlighter = useHighlighter(language);
    // const cacheKey = id ?? code;
    // const [cachedHighlights, setCachedHighlights] = useAtom(CACHED_HIGHLIGHTS_ATOM);
    // const previousCode = usePrevious(code);

    // // useEffect(() => {
    // //     setCachedHighlights((prevCache) => {
    // //         if (prevCache[cacheKey] != null && isEqual(prevCache[cacheKey], tokens)) {
    // //             return prevCache;
    // //         }
    // //         return { ...prevCache, [cacheKey]: tokens };
    // //     });
    // // }, [highlight, code, language, setCachedHighlights, cacheKey, previousCode]);

    const tokens = useMemo(() => {
        if (highlighter == null) {
            return createRawTokens(code, language);
        }
        try {
            return highlightTokens(highlighter, code, language);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return createRawTokens(code, language);
        }
    }, [code, highlighter, language]);

    return <FernSyntaxHighlighterTokens ref={ref} tokens={tokens} {...innerProps} />;
});

FernSyntaxHighlighter.displayName = "FernSyntaxHighlighter";
