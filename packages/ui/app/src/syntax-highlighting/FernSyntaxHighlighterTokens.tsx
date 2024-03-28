import cn from "clsx";
import { Element } from "hast";
import { camelCase, isEqual } from "lodash-es";
import { ReactNode, forwardRef, memo, useMemo } from "react";
import StyleToObject from "style-to-object";
import { visit } from "unist-util-visit";
import { emitDatadogError } from "../analytics/datadogRum";
import { FernScrollArea } from "../components/FernScrollArea";
import { HastToJSX } from "../mdx/common/HastToJsx";
import "./FernSyntaxHighlighter.css";
import { HighlightedTokens } from "./fernShiki";

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

interface FernSyntaxHighlighterTokensCodeProps {
    tokens: HighlightedTokens;
    fontSize?: "sm" | "base" | "lg";
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";
}

export interface FernSyntaxHighlighterTokensProps extends FernSyntaxHighlighterTokensCodeProps {
    className?: string;
    style?: React.CSSProperties;
    viewportRef?: React.RefObject<HTMLDivElement>;
    maxLines?: number;
}

const FernSyntaxHighlighterTokensCode = memo<FernSyntaxHighlighterTokensCodeProps>(
    function FernSyntaxHighlighterTokensCode({ fontSize = "base", highlightLines, highlightStyle, tokens }) {
        const highlightedLines = useMemo(() => flattenHighlightLines(highlightLines || []), [highlightLines]);
        const lines = useMemo(() => {
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
            return lines;
        }, [tokens.hast]);

        return (
            <code
                className={cn("code-block", {
                    "text-xs": fontSize === "sm",
                    "text-sm": fontSize === "base",
                    "text-base": fontSize === "lg",
                })}
            >
                <div className="code-block-inner">
                    <table
                        className={cn("code-block-line-group", {
                            "highlight-focus": highlightStyle === "focus" && highlightedLines.length > 0,
                            "gutter-cli": tokens.lang === "cli" || tokens.lang === "shell" || tokens.lang === "bash",
                            plaintext: tokens.lang === "plaintext" || tokens.lang === "text" || tokens.lang === "txt",
                        })}
                    >
                        <colgroup>
                            <col className="w-fit" />
                            <col />
                        </colgroup>
                        <tbody>
                            {lines.map((line, lineNumber) => (
                                <tr
                                    className={cn("code-block-line", {
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
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.tokens === nextProps.tokens &&
            prevProps.fontSize === nextProps.fontSize &&
            isEqual(prevProps.highlightLines, nextProps.highlightLines) &&
            prevProps.highlightStyle === nextProps.highlightStyle
        );
    },
);

export const FernSyntaxHighlighterTokens = memo(
    forwardRef<HTMLPreElement, FernSyntaxHighlighterTokensProps>(
        (
            { className, style, fontSize = "base", highlightLines, highlightStyle, viewportRef, tokens, maxLines },
            ref,
        ) => {
            const preStyle = useMemo(() => {
                let preStyle = {};

                visit(tokens.hast, "element", (node) => {
                    if (node.tagName === "pre") {
                        preStyle = parseStyle(node.properties.style) ?? {};
                    }
                });
                return preStyle;
            }, [tokens.hast]);

            return (
                <pre
                    className={cn("code-block-root not-prose", className)}
                    style={{ ...style, ...preStyle }}
                    ref={ref}
                    tabIndex={0}
                >
                    <FernScrollArea
                        viewportRef={viewportRef}
                        style={{
                            maxHeight: getMaxHeight(fontSize, maxLines),
                        }}
                    >
                        <FernSyntaxHighlighterTokensCode
                            tokens={tokens}
                            fontSize={fontSize}
                            highlightLines={highlightLines}
                            highlightStyle={highlightStyle}
                        />
                    </FernScrollArea>
                </pre>
            );
        },
    ),
    (prevProps, nextProps) => {
        return (
            prevProps.tokens === nextProps.tokens &&
            prevProps.className === nextProps.className &&
            isEqual(prevProps.style, nextProps.style) &&
            prevProps.fontSize === nextProps.fontSize &&
            isEqual(prevProps.highlightLines, nextProps.highlightLines) &&
            prevProps.highlightStyle === nextProps.highlightStyle
        );
    },
);
FernSyntaxHighlighterTokens.displayName = "FernSyntaxHighlighterTokens";

function getMaxHeight(fontSize: "sm" | "base" | "lg", maxLines?: number): number | undefined {
    if (maxLines == null || maxLines <= 0) {
        return undefined;
    }

    const lineHeight = 1.625 * (fontSize === "sm" ? 12 : fontSize === "base" ? 14 : 16);

    return maxLines * lineHeight + (fontSize === "sm" ? 8 : 12) * 2;
}

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

        emitDatadogError(e, {
            context: "FernSyntaxHighlighter",
            errorSource: "parseStyle",
            errorDescription: "Failed to parse style originating from shiki",
            data: { value },
        });

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
