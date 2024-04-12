import cn from "clsx";
import type { Element } from "hast";
import { isEqual } from "lodash-es";
import { ReactElement, forwardRef, memo, useImperativeHandle, useMemo, useRef } from "react";
import { visit } from "unist-util-visit";
import { FernScrollArea } from "../components/FernScrollArea";
import { HastToJSX } from "../mdx/common/HastToJsx";
import { parseStringStyle } from "../util/parseStringStyle";
import "./FernSyntaxHighlighter.css";
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
        prevProps.tokens === nextProps.tokens
    );
}

export const FernSyntaxHighlighterTokens = memo(
    forwardRef<HTMLPreElement, FernSyntaxHighlighterTokensProps>(
        (
            { className, style, fontSize = "base", highlightLines, highlightStyle, viewportRef, tokens, maxLines },
            ref,
        ) => {
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

            const highlightedLines = useMemo(() => {
                const toRet: number[] = [];
                if (highlightStyle !== "focus") {
                    toRet.push(...flattenHighlightLines(highlightLines ?? []));
                }

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (isStringOrArray(line.properties.class)) {
                        if (line.properties.class.includes("highlighted")) {
                            toRet.push(i);
                        }
                    }
                }

                return toRet;
            }, [highlightLines, highlightStyle, lines]);

            const focusedLines = useMemo(() => {
                const toRet: number[] = [];
                if (highlightStyle === "focus") {
                    toRet.push(...flattenHighlightLines(highlightLines ?? []));
                }

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (isStringOrArray(line.properties.class)) {
                        if (line.properties.class.includes("focused")) {
                            toRet.push(i);
                        }
                    }
                }

                return toRet;
            }, [highlightLines, highlightStyle, lines]);

            const preClassNames = useMemo(() => {
                const classNames: string[] = [];

                visit(tokens.hast, "element", (node) => {
                    if (node.tagName === "pre") {
                        if (typeof node.properties.class === "string") {
                            classNames.push(...node.properties.class.split(" "));
                        } else if (Array.isArray(node.properties.class)) {
                            classNames.push(...(node.properties.class as string[]));
                        }
                        return false; // stop traversing
                    }
                    return true;
                });

                if (highlightedLines.length > 0 && !classNames.includes("has-highlighted")) {
                    classNames.push("has-highlighted");
                }

                if (focusedLines.length > 0 && !classNames.includes("has-focused")) {
                    classNames.push("has-focused");
                }

                if (tokens.lang === "plaintext" || tokens.lang === "text" || tokens.lang === "txt") {
                    classNames.push("plaintext");
                }

                return classNames;
            }, [focusedLines.length, highlightedLines.length, tokens.hast, tokens.lang]);

            const lang = tokens.lang;
            const gutterCli = lang === "cli" || lang === "shell" || lang === "bash";
            const plaintext = tokens.lang === "plaintext" || tokens.lang === "text" || tokens.lang === "txt";

            const lineNumbers = useMemo<number[]>(() => {
                let addCount = 0;
                let removeCount = 0;
                return lines.map((line): number => {
                    if (hasDiffRemove(line)) {
                        removeCount++;
                        return removeCount;
                    } else {
                        removeCount = addCount;
                    }

                    addCount++;
                    removeCount++;
                    return addCount;
                });
            }, [lines]);

            const renderRow = useMemo(
                () => createRowRenderer(plaintext, gutterCli, preClassNames.includes("has-diff"), lineNumbers),
                [plaintext, gutterCli, preClassNames, lineNumbers],
            );

            return (
                <pre
                    className={cn("code-block-root not-prose", className, preClassNames)}
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
                                <table className={cn("code-block-line-group")}>
                                    {!plaintext && (
                                        <colgroup>
                                            <col className="w-fit" />
                                            <col />
                                        </colgroup>
                                    )}
                                    <tbody>
                                        {lines.map((line, lineNumber) => (
                                            <tr
                                                className={cn("code-block-line", line.properties.class, {
                                                    highlighted: highlightedLines.includes(lineNumber),
                                                    focused: focusedLines.includes(lineNumber),
                                                })}
                                                key={lineNumber}
                                            >
                                                {renderRow(lineNumber, line)}
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
    ),
    fernSyntaxHighlighterTokenPropsAreEqual,
);
FernSyntaxHighlighterTokens.displayName = "FernSyntaxHighlighterTokens";

export function createRowRenderer(
    plaintext: boolean,
    gutterCli: boolean,
    hasDiff: boolean,
    lineNumbers: number[],
): (lineNumber: number, line: Element) => ReactElement {
    return function rowRenderer(i: number, line: Element) {
        const lineNumber = lineNumbers[i];
        return (
            <>
                {!plaintext && (
                    <td className="code-block-line-gutter">
                        <span>{gutterCli ? (lineNumber === 1 ? "$" : ">") : lineNumber}</span>
                    </td>
                )}
                {hasDiff && (
                    <td className="code-block-line-diff">
                        {hasDiffAdd(line) ? <span>{"+"}</span> : hasDiffRemove(line) ? <span>{"-"}</span> : null}
                    </td>
                )}
                <td className="code-block-line-content">
                    {line.children.map((child, i) => (
                        <HastToJSX hast={child} key={i} />
                    ))}
                </td>
            </>
        );
    };
}

function hasDiffAdd(line: Element): boolean {
    return (
        isStringOrArray(line.properties.class) &&
        line.properties.class.includes("diff") &&
        line.properties.class.includes("add")
    );
}

function hasDiffRemove(line: Element): boolean {
    return (
        isStringOrArray(line.properties.class) &&
        line.properties.class.includes("diff") &&
        line.properties.class.includes("remove")
    );
}

function isStringOrArray(value: unknown): value is string | string[] {
    return typeof value === "string" || Array.isArray(value);
}
