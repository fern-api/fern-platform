import classNames from "classnames";
import { useTheme } from "next-themes";
import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react";
import { createElement, PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import prism from "react-syntax-highlighter/dist/cjs/styles/prism/prism";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";

// [number, number] is a range of lines to highlight
type HighlightLine = number | [number, number];

export type CodeBlockSkeletonProps = {
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
    // usePlainStyles = false,
    fontSize,
    style,
    highlightLines,
    highlightStyle,
}) => {
    return (
        <div
            className={classNames(
                "font-mono",
                // {
                //     "w-full border-l border-r border-b rounded-bl-lg rounded-br-lg border-default": !usePlainStyles,
                // },
                className,
            )}
            style={style}
        >
            <FernSyntaxHighlighter
                language={language}
                fontSize={fontSize}
                highlightLines={highlightLines}
                highlightStyle={highlightStyle}
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

interface FernSyntaxHighlighterProps extends React.ComponentProps<typeof SyntaxHighlighter> {
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";
    fontSize?: "sm" | "lg";
}

export const FernSyntaxHighlighter: React.FC<FernSyntaxHighlighterProps> = ({
    highlightLines,
    highlightStyle,
    fontSize = "sm",
    ...props
}) => {
    const { resolvedTheme: theme } = useTheme();
    return (
        <SyntaxHighlighter
            {...props}
            style={theme === "dark" ? vscDarkPlus : prism}
            customStyle={{
                fontSize: fontSize === "sm" ? "12px" : "14px",
                lineHeight: fontSize === "sm" ? "20px" : "24px",
                color: "inherit",
                margin: 0,
                background: "unset",
                backgroundColor: "unset",
                fontFamily: "inherit",
                textShadow: "unset",
                border: "unset",
                ...props.customStyle,
            }}
            codeTagProps={{
                ...props.codeTagProps,
                style: props.codeTagProps?.style,
            }}
            PreTag="pre"
            CodeTag={CodeTag}
            renderer={createHighlightRenderer(highlightLines, highlightStyle, theme as "light" | "dark")}
            showLineNumbers={true}
        />
    );
};

function CodeTag({ children, ...rest }: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) {
    return (
        <code {...rest} className={classNames(rest.className, "font-mono")}>
            {children}
        </code>
    );
}
