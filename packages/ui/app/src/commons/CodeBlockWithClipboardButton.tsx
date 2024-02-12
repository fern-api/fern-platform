import classNames from "classnames";
import dynamic from "next/dynamic";
import React from "react";
import { FernScrollArea } from "../components/FernScrollArea";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

const CodeBlockSkeleton = dynamic(
    () => import("./CodeBlockSkeleton").then(({ CodeBlockSkeleton }) => CodeBlockSkeleton),
    { ssr: true },
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
        <FernScrollArea className="group/cb-container dark:bg-tag-default-soft after:ring-border-default relative mb-5 flex max-h-[350px] w-full rounded-lg bg-white/70 shadow-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-inset after:content-['']">
            <CodeBlockSkeleton language={language} content={content} fontSize={variant} />
            <CopyToClipboardButton
                className={classNames(
                    "absolute z-20",
                    "transition opacity-0 group-hover/cb-container:opacity-100 z-10",
                    {
                        "right-0.5 top-0.5": variant === "sm",
                        "right-1 top-1": variant === "lg",
                    },
                )}
                content={content}
            />
        </FernScrollArea>
    );
};
