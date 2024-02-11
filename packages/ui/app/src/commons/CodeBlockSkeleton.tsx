import classNames from "classnames";
import { useTheme } from "next-themes";
import React, { CSSProperties } from "react";
import { createElement, Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as prism from "react-syntax-highlighter/dist/cjs/styles/prism";

// [number, number] is a range of lines to highlight
type HighlightLine = number | [number, number];

type CodeBlockSkeletonProps = {
    className?: string;
    language: string;
    content: string;
    usePlainStyles?: boolean;
    fontSize: "sm" | "lg";
    style?: React.CSSProperties;
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";
};

export const CodeBlockSkeleton: React.FC<CodeBlockSkeletonProps> = ({
    className,
    language,
    content,
    usePlainStyles = false,
    fontSize,
    style,
    highlightLines,
    highlightStyle,
}) => {
    const { resolvedTheme: theme } = useTheme();
    return (
        <div
            className={classNames(
                "font-mono",
                {
                    "w-full rounded-bl-lg rounded-br-lg": !usePlainStyles,
                },
                className,
            )}
            style={style}
        >
            <FernSyntaxHighlighter
                language={language}
                PreTag="pre"
                customStyle={{
                    fontSize: fontSize === "sm" ? 12 : 14,
                    lineHeight: fontSize === "sm" ? "20px" : "24px",
                }}
                renderer={createHighlightRenderer(highlightLines, highlightStyle, theme as "light" | "dark")}
            >
                {content}
            </FernSyntaxHighlighter>
        </div>
    );
};

function flattenHighlightLines(highlightLines: HighlightLine[]): number[] {
    return highlightLines.flatMap((line) => {
        if (Array.isArray(line)) {
            const [start, end] = line;
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return [line];
    });
}

function createHighlightRenderer(
    highlightLines: HighlightLine[] | undefined,
    highlightStyle: "highlight" | "focus" = "highlight",
    theme: "light" | "dark",
) {
    if (highlightLines == null || highlightLines.length === 0) {
        return undefined;
    }
    const flattenedLines = flattenHighlightLines(highlightLines);
    return function renderer({ rows, stylesheet, useInlineStyles }: rendererProps) {
        return (
            <>
                {rows.map((row, i) =>
                    createElement({
                        node: row,
                        stylesheet,
                        style: createStyle(flattenedLines.includes(i), highlightStyle, theme),
                        useInlineStyles,
                        key: i,
                    }),
                )}
            </>
        );
    };
}

function createStyle(
    isHighlighted: boolean,
    highlightStyle: "highlight" | "focus",
    theme: "light" | "dark",
): CSSProperties {
    if (highlightStyle === "highlight") {
        return {
            display: "block",
            marginLeft: "-16px",
            marginRight: "-16px",
            paddingLeft: "14px",
            paddingRight: "16px",
            borderLeft: isHighlighted
                ? theme === "light"
                    ? "2px solid rgb(var(--accent-primary-light))"
                    : "2px solid rgb(var(--accent-primary-dark))"
                : "2px solid transparent",
            backgroundColor: isHighlighted
                ? theme === "light"
                    ? "rgba(var(--accent-primary-light), 20%)"
                    : "rgba(var(--accent-primary-dark), 20%)"
                : "unset",
        };
    }
    return {
        opacity: isHighlighted ? 1 : 0.33,
    };
}

export const FernSyntaxHighlighter: React.FC<React.ComponentProps<typeof SyntaxHighlighter>> = (props) => {
    const { resolvedTheme: theme } = useTheme();
    return (
        <SyntaxHighlighter
            {...props}
            style={theme === "dark" ? prism.vscDarkPlus : prism.oneLight}
            customStyle={{
                width: "100%",
                overflowX: "auto",
                margin: 0,
                paddingRight: 16,
                paddingLeft: 16,
                paddingBottom: 12,
                background: "unset",
                backgroundColor: "unset",
                fontFamily: "inherit",
                ...props.customStyle,
            }}
            codeTagProps={{
                ...props.codeTagProps,
                style: {
                    background: "unset",
                    fontFamily: "unset",
                    fontSize: "unset",
                    ...props.codeTagProps?.style,
                },
            }}
        />
    );
};
