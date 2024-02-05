import classNames from "classnames";
import React from "react";
import { CodeBlockSkeleton } from "./CodeBlockSkeleton";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

type CodeBlockWithClipboardButtonProps = {
    variant: "sm" | "lg";
    language: string;
    content: string;
};

export const CodeBlockWithClipboardButton: React.FC<CodeBlockWithClipboardButtonProps> = ({
    variant,
    language,
    content,
}) => {
    return (
        <div className="group/cb-container bg-background-primary-light dark:bg-background-primary-dark border-border-default-light dark:border-border-default-dark relative mb-5 w-full min-w-0 max-w-full rounded-lg border">
            <CopyToClipboardButton
                className={classNames(
                    "absolute right-3 top-3 ml-auto",
                    "transition opacity-0 group-hover/cb-container:opacity-100",
                    {
                        "right-3 top-3": variant === "sm",
                        "right-4 top-4": variant === "lg",
                    },
                )}
                content={content}
            />
            <CodeBlockSkeleton
                language={language}
                content={content}
                fontSize={variant}
                className="max-h-[350px] overflow-y-auto rounded-t-lg"
            />
        </div>
    );
};
