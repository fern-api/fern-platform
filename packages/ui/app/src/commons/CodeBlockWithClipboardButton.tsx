import classNames from "classnames";
import dynamic from "next/dynamic";
import React from "react";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

const CodeBlockSkeleton = dynamic(
    () => import("./CodeBlockSkeleton").then(({ CodeBlockSkeleton }) => CodeBlockSkeleton),
    { ssr: false },
);

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
        <div className="group/cb-container border-default relative mb-5 flex w-full rounded-t-lg border-t">
            <CopyToClipboardButton
                className={classNames("absolute", "transition opacity-0 group-hover/cb-container:opacity-100", {
                    "right-0.5 top-0.5": variant === "sm",
                    "right-1 top-1": variant === "lg",
                })}
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
