import classNames from "classnames";
import { useTheme } from "next-themes";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as prism from "react-syntax-highlighter/dist/cjs/styles/prism";

type CodeBlockSkeletonProps = {
    className?: string;
    language: string;
    content: string;
    usePlainStyles?: boolean;
    fontSize: "sm" | "lg";
    style?: React.CSSProperties;
};

export const CodeBlockSkeleton: React.FC<CodeBlockSkeletonProps> = ({
    className,
    language,
    content,
    usePlainStyles = false,
    fontSize,
    style,
}) => {
    return (
        <div
            className={classNames(
                "font-mono",
                {
                    "w-full rounded-bl-lg rounded-br-lg": !usePlainStyles,
                },
                className
            )}
            style={style}
        >
            <FernSyntaxHighlighter
                language={language}
                PreTag="pre"
                customStyle={{
                    fontSize: fontSize === "sm" ? 12 : 14,
                    lineHeight: fontSize === "sm" ? "18px" : "20px",
                }}
            >
                {content}
            </FernSyntaxHighlighter>
        </div>
    );
};

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
                paddingRight: 12,
                paddingLeft: 12,
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
