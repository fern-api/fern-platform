import { h } from "hastscript";
import { atom, useAtom } from "jotai";
import { isEqual } from "lodash-es";
import { forwardRef, useEffect, useState, useTransition } from "react";
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
        const [, startTransition] = useTransition();
        const cacheKey = id ?? code;
        const [cachedHighlights, setCachedHighlights] = useAtom(CACHED_HIGHLIGHTS_ATOM);
        const [tokens, setTokens] = useState(() => cachedHighlights[cacheKey] ?? createRawTokens(code, language));

        useEffect(() => {
            if (highlighter != null) {
                startTransition(() => {
                    const tokens = highlightTokens(highlighter, code, language);
                    setTokens((prevTokens) => {
                        if (prevTokens != null && !isEqual(prevTokens, tokens)) {
                            return prevTokens;
                        }
                        setCachedHighlights((prevCache) => ({ ...prevCache, [cacheKey]: tokens }));
                        return tokens;
                    });
                });
            }
        }, [highlighter, code, language, setCachedHighlights, cacheKey]);

        return <FernSyntaxHighlighterTokens ref={ref} tokens={tokens} {...props} />;
    },
);
