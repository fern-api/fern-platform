import { useMounted } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useTheme } from "next-themes";
import { forwardRef, useEffect, useMemo, useState } from "react";
import type { BundledLanguage, BundledTheme, Highlighter, SpecialLanguage, ThemedTokenWithVariants } from "shiki";
import { getHighlighter } from "shiki";
import { FernScrollArea } from "../components/FernScrollArea";
import "./FernSyntaxHighlighter.css";

// [number, number] is a range of lines to highlight
type HighlightLine = number | [number, number];

interface FernSyntaxHighlighterProps {
    className?: string;
    style?: React.CSSProperties;
    code: string;
    language: string;
    fontSize?: "sm" | "base" | "lg";
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";
    viewportRef?: React.RefObject<HTMLDivElement>;
}

interface FernSyntaxHighlighterContentProps extends Omit<FernSyntaxHighlighterProps, "code" | "language"> {
    tokens: ThemedTokenWithVariants[][];
    gutterCli?: boolean;
}

export const FernSyntaxHighlighter = forwardRef<HTMLPreElement, FernSyntaxHighlighterProps>(
    function FernSyntaxHighlighter({ code, language, ...props }, ref) {
        const [result, setResult] = useState<ThemedTokenWithVariants[][]>([]);
        useEffect(() => {
            void (async () => {
                setResult(await highlight(trimCode(code), language));
            })();
        }, [code, language]);

        return (
            <FernSyntaxHighlighterContent
                ref={ref}
                tokens={result}
                gutterCli={language === "bash" || language === "shell"}
                {...props}
            />
        );
    },
);

export const FernSyntaxHighlighterContent = forwardRef<HTMLPreElement, FernSyntaxHighlighterContentProps>(
    function FernSyntaxHighlighter(
        { className, gutterCli, style, tokens, fontSize = "base", highlightLines, highlightStyle, viewportRef },
        ref,
    ) {
        const { resolvedTheme: theme } = useTheme();
        const highlightedLines = useMemo(() => flattenHighlightLines(highlightLines || []), [highlightLines]);
        const isMounted = useMounted();

        const renderCodeBlockLineGroup = (variant: "light" | "dark") => (
            <table
                className={classNames("code-block-line-group", {
                    "highlight-focus": highlightStyle === "focus" && highlightedLines.length > 0,
                    "gutter-cli": gutterCli,
                })}
            >
                <tbody>
                    {tokens.map((line, lineNumber) => (
                        <tr
                            className={classNames("code-block-line", {
                                highlight: highlightedLines.includes(lineNumber),
                            })}
                            key={lineNumber}
                        >
                            <td className="code-block-line-gutter" />
                            <td className="code-block-line-content">
                                {line.map((token, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            color: token.variants[variant]?.color,
                                            backgroundColor: token.variants[variant]?.bgColor,
                                        }}
                                    >
                                        {token.content}
                                    </span>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );

        return (
            <pre className={classNames("code-block-root", className)} style={style} ref={ref}>
                <FernScrollArea viewportRef={viewportRef}>
                    <code
                        className={classNames("code-block", {
                            "text-xs": fontSize === "sm",
                            "text-sm": fontSize === "base",
                            "text-base": fontSize === "lg",
                        })}
                    >
                        {(!isMounted || theme === "light") && (
                            <div className="code-block-inner block dark:hidden">
                                {renderCodeBlockLineGroup("light")}
                            </div>
                        )}
                        {(!isMounted || theme === "dark") && (
                            <div className="code-block-inner hidden dark:block">{renderCodeBlockLineGroup("dark")}</div>
                        )}
                    </code>
                </FernScrollArea>
            </pre>
        );
    },
);

// remove leading and trailing newlines
function trimCode(code: string): string {
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

const LANGUAGES: Array<BundledLanguage | SpecialLanguage> = [
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

const LIGHT_THEME: BundledTheme = "min-light";
const DARK_THEME: BundledTheme = "material-theme-darker";

let highlighter: Highlighter;
export async function highlight(code: string, lang: string): Promise<ThemedTokenWithVariants[][]> {
    if (!highlighter) {
        highlighter = await getHighlighter({
            langs: LANGUAGES,
            themes: [LIGHT_THEME, DARK_THEME],
        });
    }

    return highlighter.codeToTokensWithThemes(code, {
        lang: parseLang(lang),
        themes: {
            light: LIGHT_THEME,
            dark: DARK_THEME,
        },
    });
}

function parseLang(lang: string): BundledLanguage | SpecialLanguage {
    if (LANGUAGES.includes(lang as BundledLanguage)) {
        return lang as BundledLanguage;
    }
    if (lang === "golang") {
        return "go";
    }
    return "plaintext";
}
