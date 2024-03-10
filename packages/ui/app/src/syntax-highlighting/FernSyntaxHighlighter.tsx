import { usePrevious } from "@fern-ui/react-commons";
import { h } from "hastscript";
import { atom, useAtom } from "jotai";
import { isEqual } from "lodash-es";
import { forwardRef, useEffect } from "react";
import { useHighlighterInstance } from "../contexts/ShikiContext";
import { HighlightedTokens, highlightTokens, trimCode } from "./fernShiki";
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

function createRawTokens(code: string, lang: string): HighlightedTokens {
    code = trimCode(code);

    return {
        code,
        lang,
        hast: {
            type: "root",
            children: [
                h("pre", [
                    h(
                        "code",
                        code
                            .split("\n")
                            .flatMap((line, idx) =>
                                idx === 0
                                    ? [h("span", { class: "line" }, line)]
                                    : ["\n", h("span", { class: "line" }, line)],
                            ),
                    ),
                ]),
            ],
        },
    };
}

export const FernSyntaxHighlighter = forwardRef<HTMLPreElement, FernSyntaxHighlighterProps>(
    function FernSyntaxHighlighter({ id, code, language, ...props }, ref) {
        const highlighter = useHighlighterInstance(language);
        const cacheKey = id ?? code;
        const [cachedHighlights, setCachedHighlights] = useAtom(CACHED_HIGHLIGHTS_ATOM);
        const previousCode = usePrevious(code);

        useEffect(() => {
            if (highlighter != null) {
                setCachedHighlights((prevCache) => {
                    const tokens = highlightTokens(highlighter, code, language);
                    if (prevCache[cacheKey] != null && isEqual(prevCache[cacheKey], tokens)) {
                        return prevCache;
                    }
                    return { ...prevCache, [cacheKey]: tokens };
                });
            } else if (code !== previousCode) {
                setCachedHighlights((prevCache) => ({ ...prevCache, [cacheKey]: createRawTokens(code, language) }));
            }
        }, [highlighter, code, language, setCachedHighlights, cacheKey, previousCode]);

        const tokens = cachedHighlights[cacheKey] ?? createRawTokens(code, language);

        return <FernSyntaxHighlighterTokens ref={ref} tokens={tokens} {...props} />;
    },
);
