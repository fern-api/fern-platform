import { h } from "hastscript";
import { forwardRef, useEffect, useMemo, useState, useTransition } from "react";
import { HighlightedTokens, highlightTokens, trimCode, useHighlighterInstance } from "./fernShiki";
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

const cachedHighlights = new Map<string, HighlightedTokens>();

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
        const [result, setResult] = useState(() => cachedHighlights.get(id ?? code) ?? createRawTokens(code, language));

        useEffect(() => {
            if (highlighter == null) {
                setResult(createRawTokens(code, language));
            } else {
                startTransition(() => {
                    const tokens = highlightTokens(highlighter, code, language);
                    cachedHighlights.set(id ?? code, tokens);
                    setResult(tokens);
                });
            }
        }, [highlighter, code, language, id]);

        const tokens = useMemo(() => result ?? createRawTokens(code, language), [code, language, result]);
        return <FernSyntaxHighlighterTokens ref={ref} tokens={tokens} {...props} />;
    },
);
