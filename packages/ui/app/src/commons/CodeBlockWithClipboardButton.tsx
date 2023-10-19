import classNames from "classnames";
import React from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
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
    const { theme } = useDocsContext();
    return (
        <div className="border-default relative mb-5 flex w-full rounded-t-lg border-t">
            <CopyToClipboardButton
                className={classNames("absolute right-3 top-3 ml-auto", {
                    "right-3 top-3": variant === "sm",
                    "right-4 top-4": variant === "lg",
                })}
                content={content}
            />
            <CodeBlockSkeleton
                theme={theme}
                language={language}
                content={content}
                fontSize={variant}
                className="border-default max-h-[350px] overflow-y-auto rounded-t-lg"
            />
        </div>
    );
};
