import classNames from "classnames";
import React from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { CodeBlockSkeleton } from "./CodeBlockSkeleton";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

type CodeBlockWithClipboardButtonProps = {
    className?: string;
    variant: "sm" | "lg";
    language: string;
    content: string;
};

export const CodeBlockWithClipboardButton: React.FC<CodeBlockWithClipboardButtonProps> = ({
    className,
    variant,
    language,
    content,
}) => {
    const { theme } = useDocsContext();
    return (
        <div className={classNames("relative mb-5 w-full", className)}>
            <div className="border-border-default-light dark:border-border-default-dark flex h-4 rounded-t-lg border-x border-t bg-gray-100/90 px-3 dark:bg-gray-950/90" />
            <CopyToClipboardButton
                className={classNames("absolute right-3 top-3 ml-auto", {
                    "right-3 top-3": variant === "sm",
                    "right-4 top-4": variant === "lg",
                })}
                content={content}
            />
            <CodeBlockSkeleton theme={theme} language={language} content={content} fontSize={variant} />
        </div>
    );
};
