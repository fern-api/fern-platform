import classNames from "classnames";
import { CSSProperties, forwardRef, ReactNode, useMemo } from "react";
import { FontStyle, type ThemedTokenWithVariants } from "shiki";
import { FernScrollArea } from "../components/FernScrollArea";
import { HighlightedTokens } from "./fernShiki";
import "./FernSyntaxHighlighter.css";

// [number, number] is a range of lines to highlight
type HighlightLine = number | [number, number];

export interface FernSyntaxHighlighterContentProps {
    className?: string;
    style?: React.CSSProperties;
    fontSize?: "sm" | "base" | "lg";
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";
    viewportRef?: React.RefObject<HTMLDivElement>;
    gutterCli?: boolean;
    plaintext?: boolean;
    children?: ReactNode;
}

export interface FernSyntaxHighlighterTokensProps {
    className?: string;
    style?: React.CSSProperties;
    fontSize?: "sm" | "base" | "lg";
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";
    viewportRef?: React.RefObject<HTMLDivElement>;
    tokens: HighlightedTokens;
}

export const FernSyntaxHighlighterTokens = forwardRef<HTMLPreElement, FernSyntaxHighlighterTokensProps>(
    function FernSyntaxHighlighterTokens(
        { className, style, fontSize = "base", highlightLines, highlightStyle, viewportRef, tokens },
        ref,
    ) {
        const highlightedLines = useMemo(() => flattenHighlightLines(highlightLines || []), [highlightLines]);

        return (
            <pre
                className={classNames("code-block-root not-prose", className)}
                style={{ ...style, color: tokens.light.fg }}
                data-dark-color={tokens.dark.fg}
                ref={ref}
            >
                <FernScrollArea viewportRef={viewportRef}>
                    <code
                        className={classNames("code-block", {
                            "text-xs": fontSize === "sm",
                            "text-sm": fontSize === "base",
                            "text-base": fontSize === "lg",
                        })}
                    >
                        <div className="code-block-inner">
                            <table
                                className={classNames("code-block-line-group", {
                                    "highlight-focus": highlightStyle === "focus" && highlightedLines.length > 0,
                                    "gutter-cli":
                                        tokens.lang === "cli" || tokens.lang === "shell" || tokens.lang === "bash",
                                    plaintext:
                                        tokens.lang === "plaintext" || tokens.lang === "text" || tokens.lang === "txt",
                                })}
                            >
                                <tbody>
                                    {tokens.tokens.map((line, lineNumber) => (
                                        <tr
                                            className={classNames("code-block-line", {
                                                highlight: highlightedLines.includes(lineNumber),
                                            })}
                                            key={lineNumber}
                                        >
                                            <td className="code-block-line-gutter" />
                                            <td className="code-block-line-content">
                                                {line.map((token, i) => (
                                                    <span key={i} style={createTokenStyle(token)}>
                                                        {token.content}
                                                    </span>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </code>
                </FernScrollArea>
            </pre>
        );
    },
);

function flattenHighlightLines(highlightLines: HighlightLine[]): number[] {
    return highlightLines.flatMap((lineNumber) => {
        if (Array.isArray(lineNumber)) {
            const [start, end] = lineNumber;
            return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
        }
        return [lineNumber - 1];
    });
}

function createTokenStyle(token: ThemedTokenWithVariants): CSSProperties | undefined {
    return {
        color: token.variants.light?.color,
        backgroundColor: token.variants.light?.bgColor,
        fontStyle: token.variants.light?.fontStyle === FontStyle.Italic ? "italic" : "normal",
        fontWeight: token.variants.light?.fontStyle === FontStyle.Bold ? "bold" : "initial",
        textDecoration: token.variants.light?.fontStyle === FontStyle.Underline ? "underline" : "none",
        "--dark-color": token.variants.dark?.color,
        "--dark-bg": token.variants.dark?.bgColor,
        "--dark-font-style": token.variants.dark?.fontStyle === FontStyle.Italic ? "italic" : "normal",
        "--dark-font-weight": token.variants.dark?.fontStyle === FontStyle.Bold ? "bold" : "initial",
        "--dark-text-decoration": token.variants.dark?.fontStyle === FontStyle.Underline ? "underline" : "none",
    } as CSSProperties;
}
