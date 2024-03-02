import { forwardRef, useEffect, useState } from "react";
import { getHighlighterInstance, HighlightedTokens, highlightTokens, trimCode } from "./fernShiki";
import "./FernSyntaxHighlighter.css";
import { FernSyntaxHighlighterTokens } from "./FernSyntaxHighlighterTokens";

// [number, number] is a range of lines to highlight
type HighlightLine = number | [number, number];

interface FernSyntaxHighlighterProps {
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
        tokens: code.split("\n").map((line) => [{ content: line, variants: {}, offset: 0 }]),
        light: { name: "light", type: "light", bg: "initial", fg: "initial" },
        dark: { name: "dark", type: "dark", bg: "initial", fg: "initial" },
    };
}

export const FernSyntaxHighlighter = forwardRef<HTMLPreElement, FernSyntaxHighlighterProps>(
    function FernSyntaxHighlighter({ id, code, language, ...props }, ref) {
        const [, setNonce] = useState<number>(0);
        const result = cachedHighlights.get(id ?? code);
        useEffect(() => {
            if (result != null) {
                return;
            }
            void (async () => {
                const highlighter = await getHighlighterInstance();
                const tokens = highlightTokens(highlighter, code, language);
                cachedHighlights.set(id ?? code, tokens);
                setNonce((nonce) => nonce + 1);
            })();
        }, [code, id, language, result]);

        return <FernSyntaxHighlighterTokens ref={ref} tokens={result ?? createRawTokens(code, language)} {...props} />;
    },
);
