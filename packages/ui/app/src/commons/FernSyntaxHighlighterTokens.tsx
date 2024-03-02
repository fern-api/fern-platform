import classNames from "classnames";
import { Element } from "hast";
import { forwardRef, ReactNode, useMemo } from "react";
import StyleToObject from "style-to-object";
import { visit } from "unist-util-visit";
import { FernScrollArea } from "../components/FernScrollArea";
import { HighlightedTokens } from "./fernShiki";
import "./FernSyntaxHighlighter.css";
import { HastToJSX } from "./HastToJsx";

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

        let preStyle = {};

        visit(tokens.hast, "element", (node) => {
            if (node.tagName === "pre") {
                preStyle = StyleToObject(node.properties.style as string) ?? {};
            }
        });

        const lines: Element[] = [];
        visit(tokens.hast, "element", (node) => {
            if (node.tagName === "code") {
                node.children.forEach((child) => {
                    if (child.type === "element" && child.tagName === "span" && child.properties.class === "line") {
                        lines.push(child);
                    }
                });
            }
        });

        return (
            <pre
                className={classNames("code-block-root not-prose", className)}
                style={{ ...style, ...preStyle }}
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
                                    {lines.map((line, lineNumber) => (
                                        <tr
                                            className={classNames("code-block-line", {
                                                highlight: highlightedLines.includes(lineNumber),
                                            })}
                                            key={lineNumber}
                                        >
                                            <td className="code-block-line-gutter" />
                                            <td className="code-block-line-content">
                                                {line.children.map((token, i) => (
                                                    <HastToJSX hast={token} key={i} />
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
