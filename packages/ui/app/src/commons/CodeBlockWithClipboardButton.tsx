import classNames from "classnames";
import React from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { CodeBlockSkeleton } from "./CodeBlockSkeleton";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

type CodeBlockWithClipboardButtonProps = {
    className?: string;
    language: string;
    content: string;
};

export const CodeBlockWithClipboardButton: React.FC<CodeBlockWithClipboardButtonProps> = ({
    className,
    language,
    content,
}) => {
    const { theme } = useDocsContext();
    return (
        <div className={classNames("relative mb-5 w-full", className)}>
            <div className="border-border-default-light dark:border-border-default-dark flex h-4 rounded-t-lg border-x border-t bg-gray-100/90 px-3 dark:bg-gray-950/90" />
            <CopyToClipboardButton className="absolute right-4 top-4 ml-auto" content={content} />
            <CodeBlockSkeleton theme={theme} language={language} content={content} />
        </div>
    );
};
