import classNames from "classnames";
import { Element } from "hast";
import { camelCase } from "lodash-es";
import { forwardRef, ReactNode, useMemo } from "react";
import StyleToObject from "style-to-object";
import { visit } from "unist-util-visit";
import { FernScrollArea } from "../components/FernScrollArea";
import { HastToJSX } from "../mdx/common/HastToJsx";
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

        let preStyle = {};

        visit(tokens.hast, "element", (node) => {
            if (node.tagName === "pre") {
                preStyle = parseStyle(node.properties.style) ?? {};
            }
        });

        const lines: Element[] = [];
        visit(tokens.hast, "element", (node) => {
            if (node.tagName === "code") {
                node.children.forEach((child) => {
                    if (child.type === "element" && child.tagName === "span") {
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
                tabIndex={0}
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
                                                <HastToJSX hast={line} />
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

function parseStyle(value: unknown): Record<string, string> | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const result: Record<string, string> = {};

    try {
        StyleToObject(value, replacer);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse style", e);
        return undefined;
    }

    function replacer(name: string, value: string) {
        let key = name;

        if (key.slice(0, 2) !== "--") {
            if (key.slice(0, 4) === "-ms-") {
                key = "ms-" + key.slice(4);
            }
            key = camelCase(key);
        }

        result[key] = value;
    }

    return result;
}
