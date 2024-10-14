import { FernScrollArea } from "@fern-ui/components";
import cn from "clsx";
import { isEqual } from "es-toolkit/predicate";
import type { Element } from "hast";
import { forwardRef, memo, useImperativeHandle, useMemo, useRef } from "react";
import { visit } from "unist-util-visit";
import { HastToJSX } from "../mdx/common/HastToJsx";
import { parseStringStyle } from "../util/parseStringStyle";
import { HighlightedTokens } from "./fernShiki";
import { flattenHighlightLines, getMaxHeight, type HighlightLine } from "./utils";

export interface ScrollToHandle {
    scrollTo: (options: ScrollToOptions) => void;
    scrollToLast: (options?: ScrollOptions) => void;
    clientHeight: number;
    scrollHeight: number;
}

export interface FernSyntaxHighlighterTokensProps {
    tokens: HighlightedTokens;
    fontSize?: "sm" | "base" | "lg";
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";

    className?: string;
    style?: React.CSSProperties;
    viewportRef?: React.RefObject<ScrollToHandle>;
    maxLines?: number;
    wordWrap?: boolean;
}

export function fernSyntaxHighlighterTokenPropsAreEqual(
    prevProps: FernSyntaxHighlighterTokensProps,
    nextProps: FernSyntaxHighlighterTokensProps,
): boolean {
    return (
        isEqual(prevProps.highlightLines, nextProps.highlightLines) &&
        isEqual(prevProps.style, nextProps.style) &&
        prevProps.fontSize === nextProps.fontSize &&
        prevProps.highlightStyle === nextProps.highlightStyle &&
        prevProps.className === nextProps.className &&
        prevProps.maxLines === nextProps.maxLines &&
        prevProps.tokens === nextProps.tokens &&
        prevProps.wordWrap === nextProps.wordWrap
    );
}

export const FernSyntaxHighlighterTokens = memo(
    forwardRef<HTMLPreElement, FernSyntaxHighlighterTokensProps>((props, ref) => {
        const {
            className,
            style,
            fontSize = "base",
            highlightLines,
            highlightStyle,
            viewportRef,
            tokens,
            maxLines,
            wordWrap,
        } = props;
        const scrollAreaRef = useRef<HTMLDivElement>(null);

        useImperativeHandle<ScrollToHandle, ScrollToHandle>(
            viewportRef,
            (): ScrollToHandle => ({
                scrollTo(options) {
                    if (scrollAreaRef.current) {
                        scrollAreaRef.current?.scrollTo(options);
                    }
                },
                scrollToLast(options) {
                    if (scrollAreaRef.current) {
                        scrollAreaRef.current?.scrollTo({
                            top: scrollAreaRef.current.scrollHeight - scrollAreaRef.current.clientHeight,
                            ...options,
                        });
                    }
                },
                get clientHeight() {
                    return scrollAreaRef.current?.clientHeight ?? 0;
                },
                get scrollHeight() {
                    return scrollAreaRef.current?.scrollHeight ?? 0;
                },
            }),
        );

        const preStyle = useMemo(() => {
            let preStyle = {};

            visit(tokens.hast, "element", (node) => {
                if (node.tagName === "pre") {
                    preStyle = parseStringStyle(node.properties.style) ?? {};
                    return false; // stop traversing
                }
                return true;
            });
            return preStyle;
        }, [tokens.hast]);

        const highlightedLines = useMemo(() => flattenHighlightLines(highlightLines ?? []), [highlightLines]);
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

        const lang = tokens.lang;
        const gutterCli = lang === "cli" || lang === "shell" || lang === "bash";
        const plaintext = tokens.lang === "plaintext" || tokens.lang === "text" || tokens.lang === "txt";

        return (
            <pre
                className={cn("code-block-root not-prose", className)}
                style={{ ...style, ...preStyle }}
                ref={ref}
                tabIndex={0}
            >
                <FernScrollArea ref={scrollAreaRef} style={{ maxHeight: getMaxHeight(fontSize, maxLines) }}>
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
                                    "word-wrap": wordWrap,
                                })}
                            >
                                {!plaintext && (
                                    <colgroup>
                                        <col className="w-fit" />
                                        <col />
                                    </colgroup>
                                )}
                                <tbody>
                                    {lines.map((line, lineNumber) => (
                                        <tr
                                            className={cn("code-block-line", {
                                                highlight: highlightedLines.includes(lineNumber),
                                            })}
                                            key={lineNumber}
                                        >
                                            {!plaintext && (
                                                <td className="code-block-line-gutter">
                                                    <span>
                                                        {gutterCli ? (lineNumber === 0 ? "$" : ">") : lineNumber + 1}
                                                    </span>
                                                </td>
                                            )}
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
    }),
    fernSyntaxHighlighterTokenPropsAreEqual,
);

FernSyntaxHighlighterTokens.displayName = "FernSyntaxHighlighterTokens";
