import { forwardRef, useMemo } from "react";
import { emitDatadogError } from "../analytics/datadogRum";
import "./FernSyntaxHighlighter.css";
import { FernSyntaxHighlighterTokens } from "./FernSyntaxHighlighterTokens";
import { createRawTokens, highlightTokens, useHighlighter } from "./fernShiki";

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
    maxLines?: number;
    disableLineNumbers?: boolean;
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

    return <FernSyntaxHighlighterTokens ref={ref} tokens={tokens} {...innerProps} />;
});

FernSyntaxHighlighter.displayName = "FernSyntaxHighlighter";
