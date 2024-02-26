import { isNonNullish } from "@fern-ui/core-utils";
import { transformerMetaHighlight } from "@shikijs/transformers";
import classNames from "classnames";
import type { Element, ElementContent, Root, RootContent, Text } from "hast";
import { omit } from "lodash-es";
import { Children, forwardRef, Fragment, isValidElement, PropsWithChildren, ReactElement, ReactNode, useMemo } from "react";
import { SpecialLanguage } from "shiki/core";
import { getHighlighter, Highlighter } from "shiki/index.mjs";
import { BundledLanguage } from "shiki/langs";
import { BundledTheme } from "shiki/themes";
import { visit } from "unist-util-visit";
import { FernScrollArea } from "../components/FernScrollArea";
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

export const FernSyntaxHighlighterContent = forwardRef<HTMLPreElement, FernSyntaxHighlighterContentProps>(
    function FernSyntaxHighlighter(
        {
            className,
            gutterCli,
            plaintext,
            style,
            fontSize = "base",
            highlightLines,
            highlightStyle,
            viewportRef,
            children,
        },
        ref,
    ) {
        const highlightedLines = useMemo(() => flattenHighlightLines(highlightLines || []), [highlightLines]);

        if (children == null) {
            return null;
        }

        const pre = findChild(children, "pre");

        if (pre == null) {
            return null;
        }

        const code = Children.toArray(pre.props.children).find(
            (d) => isValidElement(d) && d.type === "code",
        ) as React.ReactElement | null;

        if (code == null) {
            return null;
        }

        const lines = Children.toArray(code.props.children)
            .filter((d) => isValidElement(d) && d.type === "span" && d.props.className === "line");

        function removeBackground(properties: Record<string, unknown>): Record<string, unknown> {
            return omit(properties, ["background", "backgroundColor", "--shiki-dark-bg"]);
        }

        return (
            <pre
                className={classNames("code-block-root not-prose", className)}
                style={removeBackground({ ...pre.props.style, ...style })}
                ref={ref}
            >
                <FernScrollArea viewportRef={viewportRef}>
                    <code
                        className={classNames("code-block", {
                            "text-xs": fontSize === "sm",
                            "text-sm": fontSize === "base",
                            "text-base": fontSize === "lg",
                        })}
                        style={...code.props.style}
                    >
                        <div className="code-block-inner">
                            <table
                                className={classNames("code-block-line-group", {
                                    "highlight-focus": highlightStyle === "focus" && highlightedLines.length > 0,
                                    "gutter-cli": gutterCli,
                                    plaintext,
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
                                                {line}
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


// remove leading and trailing newlines
export function trimCode(code: string): string {
    return code.replace(/^\n+|\n+$/g, "");
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

export const LIGHT_THEME: BundledTheme = "min-light";
export const DARK_THEME: BundledTheme = "material-theme-darker";
export const LANGUAGES: Array<BundledLanguage | SpecialLanguage> = [
    "bash",
    "c#",
    "csharp",
    "css",
    "docker",
    "dockerfile",
    "go",
    "java",
    "javascript",
    "js",
    "json",
    "kotlin",
    "plaintext",
    "python",
    "ruby",
    "shell",
    "text",
    "ts",
    "typescript",
    "txt",
    "xml",
    "yaml",
    "yml",
];

let highlighter: Highlighter;
export async function getHighlighterInstance(): Promise<Highlighter> {
    if (!highlighter) {
        highlighter = await getHighlighter({
            langs: LANGUAGES,
            themes: [LIGHT_THEME, DARK_THEME],
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return highlighter;
}

export function highlight(
    highlighter: Highlighter,
    code: string,
    rawLang: string,
    meta?: Record<string, unknown>,
): Root {
    const lang = parseLang(rawLang);
    const root = highlighter.codeToHast(code, {
        lang,
        themes: {
            light: LIGHT_THEME,
            dark: DARK_THEME,
        },
        transformers: [transformerMetaHighlight()],
        meta,
    });
    return root as Root;
}

function parseLang(lang: string): BundledLanguage | SpecialLanguage {
    if (LANGUAGES.includes(lang as BundledLanguage)) {
        return lang as BundledLanguage;
    }
    if (lang === "golang") {
        return "go";
    }
    if (lang === "curl") {
        return "bash";
    }
    return "txt";
}

export function rehypeFernCode(): (tree: Root) => void {
    const prefix = "language-";
    return async function (tree: Root): Promise<void> {
        const highlighter = await getHighlighterInstance();
        visit(tree, "element", (node, index, parent) => {
            if (index == null) {
                return;
            }
            if (isBlockCode(node)) {
                const head = node.children.filter(isElement).find((child) => child.tagName === "code");
                if (head != null) {
                    const text = head.children.find(isText)?.value;

                    if (text == null) {
                        return;
                    }

                    const classes = head.properties.className;

                    let language = `${prefix}txt`;

                    if (Array.isArray(classes)) {
                        language = classes.find((d) => typeof d === "string" && d.startsWith(prefix)) as string ?? language;
                    }

                    const lang = language.substring(prefix.length);
                    const code =trimCode(text);
                    const hast = highlight(highlighter, code, lang).children;

                    // console.log(codeNode);
                    // console.log(node);
                    parent?.children.splice(index, 1, {
                        type: "element",
                        tagName: "SyntaxHighlighter",
                        properties: {
                            code,
                        },
                        children: hast.filter(isElement),
                    });
                }
            }
        });
    };
}

export function isBlockCode(element: Element): element is Element {
    return (
        element.tagName === "pre" &&
        Array.isArray(element.children) &&
        element.children.length === 1 &&
        isElement(element.children[0]) &&
        element.children[0].tagName === "code"
    );
}

export function isElement(value: ElementContent | Element | Root | RootContent | null | undefined): value is Element {
    return value ? value.type === "element" : false;
}

export function isText(value: ElementContent | Element | Root | RootContent | null | undefined): value is Text {
    return value ? value.type === "text" : false;
}

function findChild(children: ReactNode, type: string): ReactElement | undefined {
    const foundChild = Children.toArray(children).find(
            (d) => isValidElement(d) && d.type === type,
        ) as React.ReactElement | null;

    if (foundChild != null) {
        return foundChild;
    }

    return Children.toArray(children).filter(isFragment).map((d) => findChild(d.props.children, type)).filter(isNonNullish)[0];
}

function isFragment(value: ReactNode): value is ReactElement<PropsWithChildren> {
    return isValidElement(value) ? value.type === Fragment : false;
}
