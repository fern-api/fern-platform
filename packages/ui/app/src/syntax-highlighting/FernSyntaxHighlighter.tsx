import { forwardRef, useMemo } from "react";
import { captureSentryError } from "../analytics/sentry.js";
import { FernErrorBoundary } from "../components/FernErrorBoundary.js";
import "./FernSyntaxHighlighter.css";
import { FernSyntaxHighlighterTokens, ScrollToHandle } from "./FernSyntaxHighlighterTokens.js";
import { FernSyntaxHighlighterTokensVirtualized } from "./FernSyntaxHighlighterTokensVirtualized.js";
import { createRawTokens, highlightTokens, useHighlighter } from "./fernShiki.js";

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
            captureSentryError(e, {
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
        (maxLines != null && lines <= maxLines + 100) || lines <= 500 || maxLines == null
            ? FernSyntaxHighlighterTokens
            : FernSyntaxHighlighterTokensVirtualized;

    return (
        <FernErrorBoundary>
            <TokenRenderer ref={ref} tokens={tokens} {...innerProps} />
        </FernErrorBoundary>
    );
});

FernSyntaxHighlighter.displayName = "FernSyntaxHighlighter";
