import { usePrevious } from "@fern-ui/react-commons";
import { atom, useAtom } from "jotai";
import { isEqual } from "lodash-es";
import { forwardRef, useEffect, useMemo } from "react";
import { createRawTokens, HighlightedTokens, useHighlightTokens } from "./fernShiki";
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

const CACHED_HIGHLIGHTS_ATOM = atom<Record<string, HighlightedTokens>>({});

export const FernSyntaxHighlighter = forwardRef<HTMLPreElement, FernSyntaxHighlighterProps>((props, ref) => {
    const { id, code, language, ...innerProps } = props;
    const highlight = useHighlightTokens();
    const cacheKey = id ?? code;
    const [cachedHighlights, setCachedHighlights] = useAtom(CACHED_HIGHLIGHTS_ATOM);
    const previousCode = usePrevious(code);

    useEffect(() => {
        highlight(code, language, (tokens) => {
            setCachedHighlights((prevCache) => {
                if (prevCache[cacheKey] != null && isEqual(prevCache[cacheKey], tokens)) {
                    return prevCache;
                }
                return { ...prevCache, [cacheKey]: tokens };
            });
        });
    }, [highlight, code, language, setCachedHighlights, cacheKey, previousCode]);

    const tokens = useMemo(
        () => cachedHighlights[cacheKey] ?? createRawTokens(code, language),
        [cacheKey, cachedHighlights, code, language],
    );

    return <FernSyntaxHighlighterTokens ref={ref} tokens={tokens} {...innerProps} />;
});

FernSyntaxHighlighter.displayName = "FernSyntaxHighlighter";
