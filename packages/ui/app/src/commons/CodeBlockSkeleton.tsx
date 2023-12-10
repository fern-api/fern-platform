import { type Theme } from "@fern-ui/theme";
import classNames from "classnames";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as prism from "react-syntax-highlighter/dist/cjs/styles/prism";

type CodeBlockSkeletonProps = {
    className?: string;
    theme?: Theme;
    language: string;
    content: string;
    usePlainStyles?: boolean;
    fontSize: "sm" | "lg";
    style?: React.CSSProperties;
};

export const CodeBlockSkeleton: React.FC<CodeBlockSkeletonProps> = ({
    className,
    theme,
    language,
    content,
    usePlainStyles = false,
    fontSize,
    style,
}) => {
    return (
        <div
            className={classNames(
                "bg-gray-100/90 dark:bg-gray-950/90",
                "typography-font-code-block",
                {
                    "w-full border-l border-r border-b border-border-default-light dark:border-border-default-dark":
                        !usePlainStyles,
                },
                className
            )}
            style={style}
        >
            <SyntaxHighlighter
                style={theme === "dark" ? prism.vscDarkPlus : prism.oneLight}
                customStyle={{
                    width: "100%",
                    overflowX: "auto",
                    margin: 0,
                    paddingRight: 16,
                    paddingLeft: 16,
                    paddingBottom: 12,
                    fontSize: fontSize === "sm" ? 12 : 14,
                    lineHeight: fontSize === "sm" ? "20px" : "24px",
                    background: "unset",
                    backgroundColor: "unset",
                    fontFamily: "inherit",
                }}
                codeTagProps={{
                    style: {
                        background: "unset",
                        fontFamily: "unset",
                        fontSize: "unset",
                    },
                }}
                language={language}
                PreTag="pre"
            >
                {content}
            </SyntaxHighlighter>
        </div>
    );
};
