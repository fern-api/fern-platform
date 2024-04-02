import dynamic from "next/dynamic";
import { forwardRef, useMemo } from "react";
import { emitDatadogError } from "../analytics/datadogRum";
import "./FernSyntaxHighlighter.css";
import { FernSyntaxHighlighterTokens, ScrollToHandle } from "./FernSyntaxHighlighterTokens";
import { createRawTokens, highlightTokens, useHighlighter } from "./fernShiki";

const FernSyntaxHighlighterTokensVirtualized = dynamic(
    () =>
        import("./FernSyntaxHighlighterTokensVirtualized").then(
            ({ FernSyntaxHighlighterTokensVirtualized }) => FernSyntaxHighlighterTokensVirtualized,
        ),
    {},
);

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
    viewportRef?: React.RefObject<ScrollToHandle>;
    maxLines?: number;
}

export const FernSyntaxHighlighter = forwardRef<HTMLPreElement, FernSyntaxHighlighterProps>((props, ref) => {
    const { id, code, language, ...innerProps } = props;
    const highlighter = useHighlighter(language);

    const tokens = useMemo(() => {
        if (highlighter == null) {
            return createRawTokens(code, language);
        }
        try {
            return highlightTokens(highlighter, code, language);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            emitDatadogError(e, {
                context: "FernSyntaxHighlighter",
                errorSource: "highlightTokens",
                errorDescription: "Error occurred while highlighting tokens",
                data: {
                    code,
                    language,
                },
            });
            return createRawTokens(code, language);
        }
    }, [code, highlighter, language]);

    const { maxLines } = innerProps;

    const lines = code.split("\n").length;

    const TokenRenderer =
        (maxLines != null && lines <= maxLines + 100) || lines <= 500
            ? FernSyntaxHighlighterTokens
            : FernSyntaxHighlighterTokensVirtualized;

    return <TokenRenderer ref={ref} tokens={tokens} {...innerProps} />;
});

FernSyntaxHighlighter.displayName = "FernSyntaxHighlighter";
